<script lang="ts" setup>
import type { ColumnType } from 'nocodb-sdk'

const props = defineProps<{
  modelValue: boolean
  fields: ColumnType[]
  fileCount: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'select': [field: ColumnType]
  'cancel': []
}>()

const dialogShow = useVModel(props, 'modelValue', emit, { defaultValue: false })

const { t } = useI18n()

const selectedFieldId = ref<string | null>(props.fields[0]?.id ?? null)

const selectedField = computed(() => props.fields.find((f) => f.id === selectedFieldId.value))

const handleConfirm = () => {
  if (selectedField.value) {
    emit('select', selectedField.value)
    dialogShow.value = false
  }
}

const handleCancel = () => {
  emit('cancel')
  dialogShow.value = false
}

watch(
  () => props.fields,
  (fields) => {
    if (fields.length && !selectedFieldId.value) {
      selectedFieldId.value = fields[0]?.id ?? null
    }
  },
)
</script>

<template>
  <NcModal
    v-model:visible="dialogShow"
    :show-separator="false"
    size="small"
    wrap-class-name="nc-attachment-field-select-modal-wrapper"
    @keydown.esc="handleCancel"
  >
    <template #header>
      <div class="flex flex-col gap-1 w-full">
        <div class="text-base font-bold text-nc-content-gray-emphasis">
          {{ t('title.selectAttachmentField') }}
        </div>
        <div class="text-sm font-normal text-nc-content-gray-subtle">
          {{ t('msg.selectAttachmentFieldDescription') }}
        </div>
      </div>
    </template>

    <div class="flex flex-col gap-4 mt-2">
      <a-select
        v-model:value="selectedFieldId"
        class="w-full nc-attachment-field-select"
        :placeholder="t('placeholder.selectField')"
        dropdown-class-name="nc-attachment-field-select-dropdown"
      >
        <a-select-option
          v-for="field in fields"
          :key="field.id"
          :value="field.id"
        >
          <div class="flex items-center gap-2">
            <GeneralIcon icon="attachment" class="text-gray-500" />
            <span>{{ field.title }}</span>
          </div>
        </a-select-option>
      </a-select>

      <div class="flex justify-end gap-2">
        <NcButton type="secondary" size="small" @click="handleCancel">
          {{ t('general.cancel') }}
        </NcButton>
        <NcButton
          type="primary"
          size="small"
          :disabled="!selectedFieldId"
          @click="handleConfirm"
        >
          {{ t('activity.createNRecords', { count: fileCount }) }}
        </NcButton>
      </div>
    </div>
  </NcModal>
</template>

<style lang="scss" scoped>
.nc-attachment-field-select {
  :deep(.ant-select-selector) {
    @apply !rounded-lg;
  }
}
</style>
