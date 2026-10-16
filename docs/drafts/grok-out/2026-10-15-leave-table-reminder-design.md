DRAFT · Grok output

# Leave table + reminder design — 15.10.2026

Source: TZ #4 + leave form TZ. Design only, no deploy.

## Sheet columns

| Name | From | To | Type | Replacement | Notified? | Status |
|------|------|----|------|-------------|-----------|--------|
| | | | | | no | pending |

(Align with form response + extra Status / Decided by columns from leave form design.)

## Apps Script reminder (cheap daily)

Trigger: one time-based daily at 09:00.

Pseudo-code:
```
function dailyLeaveReminder() {
  var sheet = SpreadsheetApp.getActive().getSheetByName("Leave");
  var data = sheet.getDataRange().getValues();
  var today = new Date();
  for (var i = 1; i < data.length; i++) {
    var status = data[i][statusCol];
    var from = new Date(data[i][fromCol]);
    var notified = data[i][notifiedCol];
    if (status === "approved" && notified !== "yes" && daysBetween(today, from) === 3) {
      // post short EN reminder to PLACE Team TG group
      sheet.getRange(i+1, notifiedCol+1).setValue("yes");
    }
  }
}
```

Gas limits: one daily run, no tight loops, no large range scans if sheet grows (filter first).

See also full form design in 2026-10-15-leave-request-form.md.

ASSUMPTION: Can reuse the same sheet as the form responses.
