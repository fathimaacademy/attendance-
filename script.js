const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwk8y-8lbglVpmDT76FOXIG00uFaOh4qweAjCrO3wxqcUukZDQJ7hUedsUTrt61OBE/exec";
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);

  data.records.forEach(function (record) {
    sheet.appendRow([record.date, record.standard, record.name, record.status, record.faculty]);
  });

  return ContentService
    .createTextOutput(JSON.stringify({ result: "success" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();

  if (data.length < 2) {
    return ContentService.createTextOutput(JSON.stringify({ records: [] })).setMimeType(ContentService.MimeType.JSON);
  }

  var requestedDate = e.parameter.date;
  var results = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var cellDate = row[0];
    var cellDateStr = (Object.prototype.toString.call(cellDate) === '[object Date]')
      ? Utilities.formatDate(cellDate, Session.getScriptTimeZone(), "yyyy-MM-dd")
      : cellDate.toString().trim();

    if (cellDateStr === requestedDate) {
      results.push({
        date: cellDateStr,
        standard: row[1],
        name: row[2],
        status: row[3],
        faculty: row[4]
      });
    }
  }

  return ContentService.createTextOutput(JSON.stringify({ records: results })).setMimeType(ContentService.MimeType.JSON);
}

const students = [
  { name: "Saarah Parwin", standard: "1st", group: "a1" },
  { name: "Aasira Fathima.S", standard: "3rd", group: "a2" },
  { name: "Phavyaa Shree.G", standard: "5th", group: "a3" },
  { name: "Jussica.M", standard: "6th", group: "a4" },
  { name: "Mariya.M", standard: "6th", group: "a5" },
  { name: "Sekh Anyash.S", standard: "6th", group: "a6" },
  { name: "Afnaan.M.A", standard: "6th", group: "a7" },
  { name: "Sthevaan.M", standard: "6th", group: "a8" },
  { name: "Shivansh.R", standard: "6th", group: "a9" },
  { name: "Naveen Kumar.P", standard: "6th", group: "a10" },
  { name: "Jesseena Fathima.I", standard: "7th", group: "a11" },
  { name: "Kider Mohamed.S", standard: "7th", group: "a12" },
  { name: "Mohammed Saad Aldeen.S", standard: "7th", group: "a13" },
  { name: "Shamili.G", standard: "8th", group: "a14" },
  { name: "Devan.K", standard: "8th", group: "a15" },
  { name: "Sana Fathima.S", standard: "9th", group: "a16" },
  { name: "Rifa Fathima.K", standard: "9th", group: "a17" },
  { name: "Kaviya.P", standard: "9th", group: "a18" },
  { name: "Ilariya Rubavathi", standard: "11th", group: "a19" },
  { name: "Ibrahim.S", standard: "11th", group: "a20" },
  { name: "Afrin Fathima", standard: "12th", group: "a21" },
  { name: "Sathis Kumar.M", standard: "12th", group: "a22" }
];

function checkAttendance() {
  const dateVal = document.getElementById('reportDate').value;
  const faculty = document.getElementById('faculty').value.trim();
  const warning = document.getElementById('warning');

  if (!dateVal) {
    warning.textContent = "Please select the date.";
    warning.style.display = 'block';
    return;
  }
  if (!faculty) {
    warning.textContent = "Please enter the faculty incharge name.";
    warning.style.display = 'block';
    return;
  }

  let presentCount = 0;
  let absentCount = 0;
  let allMarked = true;
  const records = [];

  students.forEach(function (s) {
    const group = document.getElementsByName(s.group);
    let value = "";
    for (let j = 0; j < group.length; j++) {
      if (group[j].checked) value = group[j].value;
    }
    if (!value) {
      allMarked = false;
    } else if (value === 'present') {
      presentCount++;
    } else {
      absentCount++;
    }
    records.push({
      date: dateVal,
      standard: s.standard,
      name: s.name,
      status: value || "not marked",
      faculty: faculty
    });
  });

  if (!allMarked) {
    warning.textContent = "Please mark attendance (Present/Absent) for every student before submitting.";
    warning.style.display = 'block';
    return;
  }

  warning.style.display = 'none';
  document.getElementById('presentCount').textContent = presentCount;
  document.getElementById('absentCount').textContent = absentCount;

  submitToSheet(records);
}

function submitToSheet(records) {
  const status = document.getElementById('submitStatus');
  status.textContent = "Submitting...";
  status.style.color = "#444";

  fetch(SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ records: records })
  })
    .then(function () {
      status.textContent = "Attendance submitted s