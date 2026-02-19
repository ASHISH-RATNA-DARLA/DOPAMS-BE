import AWS from 'aws-sdk';
import dotenv from 'dotenv';
import { logger } from 'utils/logger';
import excel from 'exceljs';

dotenv.config();

const { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, DOCUMENT_UPLOAD_BUCKET } = process.env;

AWS.config.update({
  region: AWS_REGION,
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
});

export async function uploadToS3({
  fileContent,
  fileName,
  bucketName,
  fileType = 'IMAGE',
}: {
  fileContent: any;
  fileName: string;
  bucketName?: string;
  fileType: 'IMAGE' | 'CSV' | 'PDF' | 'SPREADSHEET';
}): Promise<any> {
  const contentTypeString = {
    IMAGE: 'image/jpeg',
    CSV: 'text/csv',
    PDF: 'application/pdf',
    SPREADSHEET: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };

  const params = {
    Bucket: bucketName || DOCUMENT_UPLOAD_BUCKET || '',
    Key: fileName,
    Body: fileContent,
    ContentType: contentTypeString[fileType],
    ACL: 'public-read',
  };

  const s3 = new AWS.S3();
  return s3
    .upload(params, function (err, data) {
      if (err) logger.error(err);
      if (data) logger.info(data);
    })
    .promise();
}

function init() {
  const workbook = new excel.Workbook();

  workbook.creator = 'Toystack AI';
  workbook.lastModifiedBy = 'Toystack AI';
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.lastPrinted = new Date();

  workbook.properties.date1904 = true;
  return workbook;
}

export function generateAndReturnExcelReport(sheetName, columns, data) {
  const workbook = init();
  const worksheet = workbook.addWorksheet(sheetName, {
    pageSetup: { fitToPage: true, orientation: 'landscape' },
  });

  worksheet.columns = columns;
  worksheet.getRow(1).eachCell(cell => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'cccccc' },
      bgColor: { argb: 'cccccc' },
    };
  });

  data.forEach(record => worksheet.addRow(record));

  return workbook.xlsx;
}
