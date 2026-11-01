const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwk8y-8lbglVpmDT76FOXIG00uFaOh4qweAjCrO3wxqcUukZDQJ7hUedsUTrt61OBE/exec";

// index.html la irukura students ah automatic ah padikum
function getStudents() {
  const students = [];
  let currentStandard = "";

  document.querySelectorAll('.container h3, .container .student-row').forEach(function (el) {
    if (el.tagName === 'H3') {
      if (/standard/i.test(el.textContent)) {
        currentStandard = el.textContent.replace(/standard/i, '').trim();
      }
    } else {
      students.push({
        row: el,
        name: el.querySelector('span').textContent.trim(),
        standard: currentStandard
      });
    }
  });

  return students;
}

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

  const students = getStudents();
  let presentCount = 0;
  let absentCount = 0;
  const notMarked = [];
  const records = [];

  students.forEach(function (s) {
    const checked = s.row.querySelector('input[type="radio"]:checked');
    if (!checked) {
      notMarked.push(s.name);
      return;
    }
    if (checked.value === 'present') presentCount++;
    else absentCount++;

    records.push({
      date: dateVal,
      standard: s.standard,
      name: s.name,
      status: checked.value,
      faculty: faculty
    });
  });

  if (notMarked.length > 0) {
    warning.textContent = "Please mark attendance for: " + notMarked.join(", ");
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
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ records: records })
  })
    .then(function () {
      status.textContent = "Attendance submitted successfully!";
      status.style.color = "green";
    })
    .catch(function (err) {
      status.textContent = "Submission failed. Check your internet connection.";
      status.style.color = "#b00020";
      console.error(err);
    });
}