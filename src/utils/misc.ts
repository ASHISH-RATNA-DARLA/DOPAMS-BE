import axios from 'axios';
import { scryptSync } from 'crypto';
import dotenv from 'dotenv';
import fs from 'fs';
import { GraphQLError } from 'graphql';
import { GraphQLEnumType } from 'graphql';
import dayjs from 'dayjs';
import ShortUniqueId from 'short-unique-id';
import { Readable } from 'stream';
import { FileUpload } from 'graphql-upload-ts';

import FileSizeLimitExceeded from './errors/file-size-limit-exceeded';
import { logger } from './logger';

dotenv.config();

const { TOMCAT_FILE_UPLOAD_URL } = process.env;

export function sanitizeValue<T>(value: T, isArray = false): T | any[] | null {
  if (value === null || value === undefined) return isArray ? [] : null;

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' ? null : (trimmed as T);
  }

  return value;
}

export function generateNumericId(): string {
  return Date.now() + Math.floor(10 + Math.random() * 90).toString();
}

export function generateReferenceId(length: number): string {
  const uid = new ShortUniqueId();
  return uid.randomUUID(length);
}

export function generateOTP(): number {
  return Math.floor(100000 + Math.random() * 900000);
}

export function getEnumValue(enumValue?: { value: any } | null) {
  return (enumValue || { value: '' }).value;
}

export function getEnumKey(enumType: GraphQLEnumType, enumValue: any | null) {
  return enumType.getValues().find(e => e.value === enumValue)?.name || '';
}

export function getEnumValueWithDefault(enumValue?: { value: any } | null, defaultValue?: string | number) {
  return (enumValue || { value: defaultValue }).value || defaultValue;
}

export function getTimeFilter(timeFilter) {
  if (timeFilter === 1)
    return {
      gte: dayjs().startOf('day').toDate(),
    };
  if (timeFilter === 2)
    return {
      gte: dayjs().startOf('week').toDate(),
    };
  if (timeFilter === 3)
    return {
      gte: dayjs().startOf('month').toDate(),
    };
  if (timeFilter === 4)
    return {
      gte: dayjs().subtract(3, 'months').toDate(),
    };
  return undefined;
}

export function getTimeFilterRaw(timeFilter) {
  if (timeFilter === 1) return dayjs().startOf('day').add(5.5, 'hours').toDate();
  if (timeFilter === 2) return dayjs().startOf('week').add(5.5, 'hours').toDate();
  if (timeFilter === 3) return dayjs().startOf('month').add(5.5, 'hours').toDate();
  if (timeFilter === 4) return dayjs().subtract(3, 'months').add(5.5, 'hours').toDate();
  return undefined;
}

export function encodeBase64(string) {
  // Create buffer object, specifying utf8 as encoding
  let bufferObj = Buffer.from(string, 'utf8');

  // Encode the Buffer as a base64 string
  let base64String = bufferObj.toString('base64');
  return base64String;
}

export function decodeBase64(string) {
  const decodedString = Buffer.from(string, 'base64').toString('utf8');
  return decodedString;
}

export function addDaysToDate(date, number) {
  const newDate = new Date(date);
  return new Date(newDate.setDate(newDate.getDate() + number));
}

export function cleanInputs(args) {
  for (const key in args) {
    if (key === 'cursor' || key === 'limit' || key === 'filters') continue;
    args[key] = isNaN(args[key]) ? args[key].trim() : args[key].toString().trim();

    if (key === 'text') {
      // Search text
      args[key] = args[key]
        .replace(/[&\\#,+()$~%'":*?<>{}]/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/[.]/g, '\\.')
        .replace(/[/]/g, '\\/')
        .trim();
    }

    if (key === 'phoneNumber')
      if (!args[key] || args[key].length !== 10 || isNaN(args[key])) {
        throw new GraphQLError('Invalid Phone Number', {
          extensions: {
            code: 'USER_INPUT_ERROR',
            invalidArgs: {
              phoneNumber: args[key],
            },
          },
        });
      }

    if (key === 'email') {
      if (!args[key] || args[key].indexOf('.') <= 0 || args[key].indexOf('@') <= 0) {
        throw new GraphQLError('Invalid Email', {
          extensions: {
            code: 'USER_INPUT_ERROR',
            invalidArgs: {
              email: args[key],
            },
          },
        });
      }
      args[key] = args[key].toString().toLowerCase();
    }

    if (key === 'otp')
      if (!args[key] || args[key].length !== 6) {
        throw new GraphQLError('Invalid OTP', {
          extensions: {
            code: 'USER_INPUT_ERROR',
            invalidArgs: {
              otp: args[key],
            },
          },
        });
      }
  }
  return args;
}

export function getPageInfo(result, limit = 20, _cursor) {
  const resultSet = result[1];
  const hasNextPage = resultSet.length > (limit || 0);
  if (hasNextPage) resultSet.pop();

  const resultSetLength = resultSet.length;
  // we are doing a take: limit + 1 to check if there is a next page. If there is, we will remove the last element.
  const cursorNode = resultSetLength > 0 ? resultSet[resultSetLength - 1] : null;

  const pageInfo = {
    totalCount: result[0],
    limit: limit || 0,
    cursor: cursorNode ? cursorNode.id : undefined,
    hasNextPage,
  };

  return { resultSet, pageInfo };
}

export function getPageInfoWithField(result, limit = 20, _cursor, fieldName = 'id') {
  const resultSet = result[1];
  const hasNextPage = resultSet.length > (limit || 0);
  if (hasNextPage) resultSet.pop();

  const resultSetLength = resultSet.length;
  // we are doing a take: limit + 1 to check if there is a next page. If there is, we will remove the last element.
  const cursorNode = resultSetLength > 0 ? resultSet[resultSetLength - 1] : null;

  const pageInfo = {
    totalCount: result[0],
    limit: limit || 0,
    cursor: cursorNode ? cursorNode[fieldName] : undefined,
    hasNextPage,
  };

  return { resultSet, pageInfo };
}

export function getRedisPageInfo(resultSet, limit, cursor) {
  const hasNextPage = resultSet.length > (limit || 0);
  if (hasNextPage) resultSet.pop();

  const resultSetLength = resultSet.length;
  const cursorNode = add(cursor || 0, resultSetLength);
  const pageInfo = {
    limit: limit || 0,
    cursor: cursorNode || undefined,
    hasNextPage,
  };

  return { resultSet, pageInfo };
}

export function getRawQueryPageInfo(result, limit, cursor) {
  const resultSet = result[1];
  const hasNextPage = resultSet.length > (limit || 0);
  if (hasNextPage) resultSet.pop();

  const resultSetLength = resultSet.length;
  // we are doing a take: limit + 1 to check if there is a next page. If there is, we will remove the last element.
  const cursorNode = add(cursor || 0, resultSetLength);

  const pageInfo = {
    totalCount: result[0],
    limit: limit || 0,
    cursor: cursorNode || undefined,
    hasNextPage,
  };

  return { resultSet, pageInfo };
}

export function getCurrentDateInIST() {
  const currentTime = new Date();

  const currentOffset = currentTime.getTimezoneOffset();

  const ISTOffset = 330; // IST offset UTC +5:30

  const ISTTime = new Date(currentTime.getTime() + (ISTOffset + currentOffset) * 60000);

  return ISTTime.toISOString();
}

export function stringToISODate(date) {
  const time = new Date(date);
  return time.toISOString();
}

export function toLocalTime(date) {
  return new Date(date).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
}

export function getCurrentDate() {
  const currentTime = new Date();
  return currentTime.toISOString();
}

export function addMinutesToCurrentDate(minutes) {
  const currentTime = new Date();
  const newTime = new Date(currentTime.getTime() + minutes * 60000);
  return newTime.toISOString();
}

export function subMinutesToCurrentDate(minutes) {
  const currentTime = new Date();
  const newTime = new Date(currentTime.getTime() - minutes * 60000);
  return newTime.toISOString();
}

export function timeDiffInMinutes(date1, date2) {
  const startDate = dayjs(date1, 'YYYY-M-DD HH:mm:ss');
  const endDate = dayjs(date2, 'YYYY-M-DD HH:mm:ss');
  return endDate.diff(startDate, 'minute');
}

export function getDateInISTWithOffset(offset: number) {
  const currentTime = new Date();

  const currentOffset = currentTime.getTimezoneOffset();

  const ISTOffset = 330; // IST offset UTC +5:30

  const ISTTime = new Date(currentTime.getTime() + (ISTOffset + currentOffset) * 60000);
  ISTTime.setDate(ISTTime.getDate() - offset);

  return ISTTime.toISOString();
}

export function add(float1, float2) {
  return parseFloat(float1) + parseFloat(float2 || 0);
}

export function addMultiple(...args) {
  return args.reduce((acc, value) => {
    return acc + parseFloat(value || 0);
  }, 0);
}

export function subtract(float1, float2) {
  return parseFloat(float1) - parseFloat(float2 || 0);
}

export function subtractMultiple(float1, float2, float3) {
  return subtract(float1, float2) - parseFloat(float3 || 0);
}

export function subtractDaysToCurrentDate(days) {
  const currentTime = new Date();
  return new Date(currentTime.setDate(currentTime.getDate() - days));
}

export function multiply(arg1, arg2) {
  return arg1 * arg2;
}

export function divide(arg1, arg2) {
  return arg1 / arg2;
}

export function getDifferencePercentage(biggerFloat, smallerfloat) {
  return 100 - (smallerfloat * 100) / biggerFloat;
}

export function sleep(seconds) {
  var e = new Date().getTime() + seconds * 1000;
  while (new Date().getTime() <= e) {}
}

export function returnSuccessHTTPResponse(message, res): string {
  res.status(200);
  return res.json({
    message,
  });
}

export async function httpPostRequestWithApiKey(payload: any, url: string, apiKeyInHeader: string) {
  const apiClient = axios.create({
    baseURL: url,
    headers: { 'content-type': 'application/json', 'User-Api-Key': apiKeyInHeader },
  });
  return apiClient.post<any>('', payload);
}

export async function httpGetRequest(url: string) {
  const apiClient = axios.create({
    baseURL: url,
  });
  return apiClient.get<any>('');
}

export function read(filePath) {
  const readableStream = fs.createReadStream(filePath);
  let file = [];
  readableStream.on('error', function (error) {
    logger.info(`error: ${error.message}`);
  });

  readableStream.on('data', chunk => {
    // @ts-ignore
    file.push(chunk);
  });

  return readableStream.on('end', function () {
    return file;
  });
}

export async function httpPostRequest(payload: any, url: string, contentType?: string) {
  const apiClient = axios.create({
    baseURL: url,
    headers: {
      'content-type': contentType || 'application/json',
    },
  });
  return apiClient.post<any>('', payload);
}

type GraphQLUploadFile = Promise<{
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => NodeJS.ReadableStream;
}>;

interface UploadToTomcatApiResponse {
  fileName?: string;
  downloadUrl?: string;
  viewUrl?: string;
  folder?: string;
  error?: string;
  message?: string;
}

export async function uploadToTomcatApi(
  folder: string,
  file: GraphQLUploadFile,
  url?: string
): Promise<UploadToTomcatApiResponse> {
  const targetUrl = url || TOMCAT_FILE_UPLOAD_URL;

  if (!targetUrl) {
    throw new Error('Tomcat file API URL is not configured. Please set TOMCAT_FILE_UPLOAD_URL in the environment.');
  }

  if (!folder) {
    throw new Error('Folder path is required for file upload.');
  }

  // Resolve the GraphQL Upload promise to get file details
  const upload = await file;
  const { filename, createReadStream } = upload;
  const stream = createReadStream();

  const formData = new (require('form-data'))();

  // Match the curl implementation: -F "folder=folderA" -F "file=@test.txt"
  formData.append('folder', folder);
  formData.append('file', stream, filename);

  const headers = {
    ...formData.getHeaders(),
  };

  try {
    const response = await axios.post(targetUrl, formData, {
      headers,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    // Check if response indicates an error (file already exists)
    if (response.data?.error) {
      logger.warn(`File upload error: ${response.data.message || response.data.error}`);
      return response.data;
    }

    return response.data;
  } catch (error: any) {
    logger.error('Error while uploading file to Tomcat API', error);
    // If axios error has response data, return it (e.g., file already exists)
    if (error?.response?.data) {
      return error.response.data;
    }
    throw error;
  }
}

interface ProcessFileUploadToTomcatResponse {
  fileName: string;
  downloadUrl: string;
  viewUrl: string;
  folder: string;
  mimeType: string;
  size: number;
}

export async function processFileUploadToTomcat(
  fileUpload: FileUpload,
  folder: string
): Promise<ProcessFileUploadToTomcatResponse> {
  try {
    const { createReadStream, filename, mimetype } = await fileUpload;
    const stream = createReadStream();

    // Read file into buffer to calculate size
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    const size = buffer.length;

    // Create a new stream from the buffer for upload
    const uploadStream = Readable.from(buffer);

    // Upload to Tomcat API
    const result = await uploadToTomcatApi(
      folder,
      Promise.resolve({
        filename,
        mimetype,
        encoding: '7bit',
        createReadStream: () => uploadStream,
      })
    );

    // Check for errors (e.g., file already exists)
    if (result.error) {
      throw new Error(result.message || result.error);
    }

    if (!result.fileName || !result.downloadUrl || !result.viewUrl) {
      throw new Error('Invalid response from Tomcat file API');
    }

    logger.info(`File uploaded successfully to Tomcat: ${filename} -> ${result.downloadUrl}`);

    return {
      fileName: result.fileName,
      downloadUrl: result.downloadUrl,
      viewUrl: result.viewUrl,
      folder: result.folder || folder,
      mimeType: mimetype,
      size,
    };
  } catch (error: any) {
    logger.error('Error processing file upload to Tomcat:', error);
    throw new Error(error.message || 'Failed to process file upload to Tomcat');
  }
}

export async function streamToBuffer(stream) {
  const chunks = [];
  let buffer: Buffer;
  buffer = await new Promise<Buffer>((resolve, reject) => {
    stream.on('data', function (chunk) {
      // @ts-ignore
      chunks.push(chunk);
    });
    stream.on('end', () => {
      buffer = Buffer.concat(chunks);
      if (buffer && buffer.length > 102400) {
        logger.error(`buffer length: ${buffer.length}`);
        reject(`File size is greater than 100KB`);
      }
      resolve(buffer);
    });
    stream.on('error', error => reject(error));
  }).catch(error => {
    throw new FileSizeLimitExceeded(error);
  });
  return buffer;
}

export function generateAddressString({ line1, line2, landmark, city, state, pincode, alternatePhone }: any) {
  return `Address Line1: ${line1},\n ${
    line2 ? 'Address Line2: ' + line2 + ',\n' : ''
  } Landmark: ${landmark},\n City: ${city},\n State: ${state},\n Pincode: ${pincode},\n Alternate Phone: ${alternatePhone}`;
}

export function getSortOptions() {
  return [
    { label: 'amount', value: 'price' },
    { label: 'data', value: 'data' },
  ];
}

export function getNearestUpperLimit(number, array) {
  // The number is never less the first element of the array. The array is already sorted
  // This loop only runs until the last number - 1 of the array
  for (let i = 0; i < array.length - 1; i++) {
    if (number <= array[i + 1] && number >= array[i]) return array[i + 1];
  }
  // 5000 is the maximum quantity of entity
  return 5000;
}

// This function is used to join args to be passed in a where clause, similar to the join function Prisma.join
export function prismaJoin(args: string[]) {
  return `(${args.map(arg => `'${arg}'`).join(',')})`;
}

export function prismaJoinString(args: string[]) {
  return `(${args.map(arg => `${arg}`).join(',')})`;
}

export function removeFromString(arr, str) {
  let regex = new RegExp('\\b' + arr.join('|') + '\\b', 'gi');
  return str.replace(regex, '');
}

export function camelCaseToSpaceSeparatedString(str) {
  return str.replace(/([A-Z])/g, ' $1').trim();
}

export function sortNumericArrayByFrequencyOfChildrenAndMakeUnique(arr: number[]): number[] {
  // Step 1: Count the frequency of each element
  const frequency: Record<number, number> = arr.reduce((acc: Record<number, number>, value: number) => {
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});

  // Step 2: Create an array of unique elements + Sort the unique array based on frequency
  const uniqueSorted: number[] = Array.from(new Set(arr)).sort(
    (a: number, b: number) => frequency[b] - frequency[a] || a - b
  );

  return uniqueSorted;
}

export function calculateFrequencyPercentageSpread(arr: number[]): { value: number; percentage: number }[] {
  const frequency = arr.reduce((acc, value) => {
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});

  const total = arr.length;

  return Object.keys(frequency).map(key => {
    const numKey = Number(key); // Convert key back to number
    return {
      value: numKey,
      percentage: (frequency[numKey] / total) * 100,
    };
  });
}

const salt = process.env.AUTHENTICATION_HASH_SALT || '';

export default function hashPassword(password: string): string {
  const hash = scryptSync(password, salt, 64);

  const hashedPassword = `${hash.toString('hex')}.${salt}`;
  return hashedPassword;
}

export function generateRandomString(length) {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var result = '';
  for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

export function getAgeFromDateOfBirth(dateOfBirth) {
  return dayjs().diff(dayjs(dateOfBirth, 'YYYY-MM-DD'), 'years');
}
