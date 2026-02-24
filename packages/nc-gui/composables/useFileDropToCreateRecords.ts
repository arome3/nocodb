import type { ColumnType, TableType, ViewType } from 'nocodb-sdk'
import type { Ref } from 'vue'
import type { Row } from '#imports'

interface UseFileDropToCreateRecordsOptions {
  meta: Ref<TableType | undefined>
  callAddEmptyRow?: (
    newRowIndex?: number,
    metaValue?: TableType,
    rowOverwrite?: Record<string, any>,
    path?: Array<number>,
  ) => Row | undefined
  updateOrSaveRow: (
    row: Row,
    property?: string,
    ltarState?: Record<string, any>,
    args?: { metaValue?: TableType; viewMetaValue?: ViewType },
    beforeRow?: string,
    path?: Array<number>,
  ) => Promise<any>
}

/**
 * CE stub — drag-drop file upload to create records is an EE-only feature.
 * Returns inert refs so CE code compiles and runs without conditional imports.
 */
export function useFileDropToCreateRecords(_options: UseFileDropToCreateRecordsOptions) {
  return {
    isProcessing: readonly(ref(false)),
    showFieldSelectDlg: ref(false),
    pendingFiles: readonly(ref<File[]>([])),
    attachmentFields: computed<ColumnType[]>(() => []),
    handleFileDrop: (_files: File[]) => {},
    onFieldSelected: (_field: ColumnType) => {},
    onFieldSelectCancelled: () => {},
  }
}
