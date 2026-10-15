# Leave / days-off — table + reminder design

Design only. No production deploy.

## Columns
Name | From | To | Type | Replacement | Notified?

## Reminder
One cheap daily run (e.g. 09:00 ICT).  
Notify 3 days before From date.  
No tight loops.

## Apps Script draft (example)

```javascript
function checkLeave() {
  const sheet = SpreadsheetApp.getActive().getSheetByName('Leave');
  const data = sheet.getDataRange().getValues();
  const today = new Date();
  for (let i = 1; i < data.length; i++) {
    const from = new Date(data[i][1]);
    const diff = (from - today) / (1000 * 60 * 60 * 24);
    if (diff <= 3 && diff >= 0 && !data[i][5]) {
      // send short message to Ops / George
      // mark Notified = yes
    }
  }
}
```

Trigger: time-driven, once per day.
