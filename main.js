/**
 * Importing modules
 */
const fs = require("fs");
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();
const puppeteer = require('puppeteer');

/**
 * Configuration of OpenAI
 */
const configuration = new Configuration({
  apiKey: process.env.API_KEY,
});

const openai = new OpenAIApi(configuration);

/**
 * Function to call API
 */
const generateAttendance = async () => {
  const chatCompletion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "generate an array of users with fake data in json format, consisting Employee ID, Employee Name, Date, Time In, Time Out, Hours Worked, and Designation, Billable / Non-Billable. Keep some billable and some non billable. Just give me the data in csv format",
      },
      {
        role: "assistant",
        content:
          "Sure! I'll generate the csv content for you and give you only the CSV content nothing else. Only CSV file content nothing else.",
      },
    ],
  });
  const data = (chatCompletion.data.choices[0].message.content);
  console.log(data);
  writeFile('employee_attendance.csv', data);
};

const generatePayroll = async () => {
  let text = "";
  readInputFile('employee_attendance.csv').then(res => {
    text = res;
  });
  const chatCompletion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "Using the csv content I am giving you and on the base of the data, calculate the payroll for the following employees. Salary of the employees as following. Manager Salary: 1,00,000, Employee: 50,000, Supervisor: 25,000. Give 10% bonus to the top 2 employees. Calculate the payroll for the employees with csv file containing Employee ID,Employee Name,Total Hours Worked,Gross Pay,Tax,Net Pay with tax calculations in india. Here's the csv content: ```" + text + "```. Only give the csv content, not anything else.",
      },
      {
        role: "assistant",
        content:
          "Sure, by reading this csv. I will give you the payroll csv file content.",
      },
    ],
  });
  const data = (chatCompletion.data.choices[0].message.content);
  console.log(data);
  writeFile('employee_payroll.csv', data);
  createPdfFromText(data, 'output.pdf');
};

/**
 * Calling the API
 */

async function main() {
  await generateAttendance();
  await generatePayroll();
}

function readInputFile(fileName) {
  return new Promise((resolve, reject) => {
    fs.readFile(fileName, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

function writeFile(fileName, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(fileName, data, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

main();

async function createPdfFromText(text, pdfFilePath) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const htmlContent = `<html><body><p>${text}</p></body></html>`;

  await page.setContent(htmlContent);
  await page.pdf({ path: pdfFilePath, format: 'A4' });

  await browser.close();
  console.log('PDF created successfully!');
}