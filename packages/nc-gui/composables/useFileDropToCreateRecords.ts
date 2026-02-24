import type { ColumnType, TableType, ViewType } from 'nocodb-sdk'
import { UITypes } from 'nocodb-sdk'
import type { Ref } from 'vue'
import type { Row } from '#imports'

interface UseFileDropToCreateRecordsOptions {
  meta: Ref<TableType | undefined>
  /** Creates an empty row in the cache and returns it. Does NOT save to server. */
  callAddEmptyRow?: (
    newRowIndex?: number,
    metaValue?: TableType,
    rowOverwrite?: Record<string, any>,
    path?: Array<number>,
  ) => Row | undefined
  /** Saves or updates a row on the server */
  updateOrSaveRow: (
    row: Row,
    property?: string,
    ltarState?: Record<string, any>,
    args?: { metaValue?: TableType; viewMetaValue?: ViewType },
    beforeRow?: string,
    path?: Array<number>,
  ) => Promise<any>
}

function extractFilenameWithoutExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.')
  return lastDot > 0 ? filename.substring(0, lastDot) : filename
}

export function useFileDropToCreateRecords(options: UseFileDropToCreateRecordsOptions) {
  const { meta, callAddEmptyRow, updateOrSaveRow } = options

  const { t } = useI18n()
  const { base } = storeToRefs(useBase())
  const { batchUploadFiles } = useAttachment()

  const isProcessing = ref(false)
  const showFieldSelectDlg = ref(false)
  const pendingFiles = ref<File[]>([])

  // Get all attachment columns from the table
  const attachmentFields = computed<ColumnType[]>(() => {
    if (!meta.value?.columns) return []
    return meta.value.columns.filter((col) => col.uidt === UITypes.Attachment && !col.system)
  })

  // Get the display (primary value) column
  const displayField = computed<ColumnType | undefined>(() => {
    return meta.value?.columns?.find((col) => col.pv)
  })

  // Check if display field is a text-like type that can hold filenames
  const isDisplayFieldText = computed(() => {
    if (!displayField.value) return false
    return [UITypes.SingleLineText, UITypes.LongText].includes(displayField.value.uidt as UITypes)
  })

  /**
   * Main entry point: called when files are dropped on the bottom drop zone
   */
  const handleFileDrop = (files: File[]) => {
    if (!files.length || !meta.value) return

    const fields = attachmentFields.value

    if (fields.length === 0) {
      message.error(t('msg.error.noAttachmentFields'))
      return
    }

    if (fields.length === 1) {
      // Auto-select the only attachment field
      processFilesWithField(files, fields[0])
    } else {
      // Show field selection dialog
      pendingFiles.value = files
      showFieldSelectDlg.value = true
    }
  }

  /**
   * Called when user selects a field from the dialog
   */
  const onFieldSelected = (field: ColumnType) => {
    const files = pendingFiles.value
    pendingFiles.value = []
    showFieldSelectDlg.value = false
    processFilesWithField(files, field)
  }

  /**
   * Called when user cancels the field selection dialog
   */
  const onFieldSelectCancelled = () => {
    pendingFiles.value = []
    showFieldSelectDlg.value = false
  }

  /**
   * Core logic: upload files first, then create records with attachment data included.
   *
   * The key insight is that we must upload files BEFORE creating the row, then include
   * the attachment JSON in the row's initial data via `rowOverwrite`. This ensures:
   * 1. The attachment value is part of the insert payload (not a separate update)
   * 2. We avoid stale row references (insertRow replaces the cached object)
   * 3. The grid renders correctly because the row data is complete on first save
   */
  const processFilesWithField = async (files: File[], attachmentColumn: ColumnType) => {
    if (!meta.value?.id || !callAddEmptyRow || isProcessing.value) return

    isProcessing.value = true
    const totalFiles = files.length
    let successCount = 0
    let failCount = 0

    try {
      message.loading(t('msg.info.uploadingFiles', { current: 0, total: totalFiles }))

      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        try {
          // Step 1: Upload the file to storage FIRST (before creating the row)
          const uploadPath = ['noco', base.value?.id, meta.value?.id, attachmentColumn.id].join('/')
          const uploadedFiles = await batchUploadFiles([file], uploadPath)

          if (!uploadedFiles?.length) {
            failCount++
            continue
          }

          // Step 2: Build row data with both filename AND attachment value included
          const rowOverwrite: Record<string, any> = {}

          // Set display field to filename (without extension) if it's a text type
          if (isDisplayFieldText.value && displayField.value?.title) {
            rowOverwrite[displayField.value.title] = extractFilenameWithoutExtension(file.name)
          }

          // Set attachment field with uploaded file data
          rowOverwrite[attachmentColumn.title!] = JSON.stringify(uploadedFiles)

          // Step 3: Create the row with all data pre-populated
          const newRow = callAddEmptyRow(undefined, meta.value, rowOverwrite, [])
          if (!newRow) {
            failCount++
            continue
          }

          // Step 4: Save the complete row (insert with attachment data included)
          await updateOrSaveRow(newRow, undefined, undefined, undefined, undefined, [])
          successCount++
        } catch (e) {
          console.error(`Failed to process file: ${file.name}`, e)
          failCount++
        }
      }

      // Show result message
      message.destroy()

      if (successCount > 0) {
        message.success(t('msg.success.createdRecords', { count: successCount }))
      }

      if (failCount > 0) {
        message.error(t('msg.error.failedToUploadFiles', { count: failCount }))
      }
    } catch (e: any) {
      message.destroy()
      message.error(t('msg.error.failedToCreateRecords'))
      console.error('Failed to create records from dropped files', e)
    } finally {
      isProcessing.value = false
    }
  }

  return {
    isProcessing: readonly(isProcessing),
    showFieldSelectDlg,
    pendingFiles: readonly(pendingFiles),
    attachmentFields,
    handleFileDrop,
    onFieldSelected,
    onFieldSelectCancelled,
  }
}
