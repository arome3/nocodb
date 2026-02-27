import { deprecate } from 'util';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc.js';
import {
  FormulaDataTypes,
  getEquivalentUIType,
  isAIPromptCol,
  isDateMonthFormat,
  isNumericCol,
  UITypes,
} from 'nocodb-sdk';
import { FieldHandler } from './field-handler';
import type { FilterOperationResult } from './field-handler/field-handler.interface';
import type { FilterType, NcContext } from 'nocodb-sdk';
// import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import type { Knex } from 'knex';
import type { IBaseModelSqlV2 } from '~/db/IBaseModelSqlV2';
import type { Model } from '~/models';
import { Column } from '~/models';
import { replaceDelimitedWithKeyValuePg } from '~/db/aggregations/pg';
import { replaceDelimitedWithKeyValueSqlite3 } from '~/db/aggregations/sqlite3';
import generateLookupSelectQuery from '~/db/generateLookupSelectQuery';
import { getRefColumnIfAlias } from '~/helpers';
import { NcError } from '~/helpers/catchError';
import { getColumnName } from '~/helpers/dbHelpers';
import { sanitize } from '~/helpers/sqlSanitize';
import { type BarcodeColumn, BaseUser, type QrCodeColumn } from '~/models';
import Filter from '~/models/Filter';
import { getAliasGenerator } from '~/utils';
import { validateAndStringifyJson } from '~/utils/tsUtils';
import { handleCurrentUserFilter } from '~/helpers/conditionHelpers';

dayjs.extend(utc);
dayjs.extend(timezone);
