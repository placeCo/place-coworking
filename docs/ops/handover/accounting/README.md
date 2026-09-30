# Accounting templates and Aiz's handover (30.09.2026)

Source: two emails from Aiz to info@ on 30.09.2026, 20:44 and 20:50 ICT. The originals are on the box in `/workspace/handover/staff/aiz-originals/` (chmod 700). They are **not in git**: they contain salary data, ID numbers, bank accounts, customer names and contacts.

## In git (sanitised, customer data and bank account number removed)

| File | What it is | Notes |
|---|---|---|
| `invoice-form-TEMPLATE.xlsx` | Invoice (ใบแจ้งหนี้), Place Co.,Ltd., TAX ID 0835566036743 | Fields: customer Name/Address/Tel/Email/TAX ID; Invoice No `YYYY-NNNN` (last seen 2026-0027); Date; lines No/Description/Amount (rows 16–25). Total = SUM; **VAT 7% included** (`K26-K26*100/107`); Grand Total = Total. Payment block: KASIKORNBANK, SWIFT KASITHBK, account name Place Company Limited (number: ask the accountant/George). |
| `invoice-form-withhold-tax-TEMPLATE.xlsx` | Invoice with withholding tax | VAT **added** on top (`K26*7%`). Label says «Withhold TAX 5%» but the formula is **3%** of (Total − VAT). Grand Total = Total + WHT, **without VAT**. The formulas need checking with Pat. |
| `receipt-form-TEMPLATE.xlsx` | Tax invoice / Receipt (ใบเสร็จรับเงิน) | Receipt No (last seen `20265-34153`, no clear pattern); the line amount is entered net (`gross*100/107`), VAT 7% added, Grand Total = Total + VAT. Payment: «Paid by transfer/cash <date>». |
| `receipt-form-withhold-tax-TEMPLATE.xlsx` | Tax invoice / Receipt with WHT | VAT added; WHT **5%** of (Total − VAT); Grand Total = Total + WHT, **without VAT**. Header label says «Invoice No». The formulas need checking with Pat. |

WHT check (Thai rules, to confirm with Pat): WHT is taken from the amount **before VAT**: rent 5%, services 3%. Grand Total = amount + VAT − WHT.

## Not in git (box only, `/workspace/handover/staff/aiz-originals/`)

- `Supplier and Product detail.xlsx`: 34 rows. Columns: Supplier/Product, Contact, By App, Amount, Payment by, Payment (due), reg (Monthly/Year/by order), Remark. Holds recurring bills, suppliers with bank accounts, service contacts.
- `Salary 9-69.xlsx`: payroll for September 2569 (2026). The layout is described below; no values are given here.
- `Sales report 26.zip`: Loyverse receipt exports, January to 29 September 2026.

### Recurring bills (from the supplier sheet, without account numbers)

| Bill | Amount | Due | Paid by | Remark |
|---|---|---|---|---|
| Electricity (PEA 1129) | 43,000–57,000 ฿ | 8th | QR / shop | Sak controls |
| Water | 900–1,500 ฿ | 20th | QR / shop | send bill to Lena |
| Internet ×4 (3BB/1530) | 1,924.93 + 3×1,496.93 ฿ | 8th, 12th, 28th | customer no. | inform Lena |
| Printer rental | 2,675 ฿ | after 10th | bank transfer | contract ends 27 Feb |
| Billboard | 5,000 ฿ | 5th | bank transfer | contract ends 27 Feb |
| Office mobile (Dtac) | 300–400 ฿ | on top-up | phone no. | inform Lena |
| Garbage (Chalong municipality) | 7,200 ฿/year | after October | cash / QR at municipality | inform Sak and Lena |
| Secom (emergency button) | 24,396 ฿ | February / July | QR | twice a year |

Service contacts listed (phones in the original): septic pumping, elevator technician, air-con technician, coffee machine, ice, water tank. **No electrician, plumber, fire alarm or landlord contact.** Secom is the only alarm-type service.

### Salary form layout (no values)

Header: company name and tax ID; «(หักปกติ 5%)». Columns: No, ID card, title + first name + last name, **income** (salary, unpaid leave, total income = salary − unpaid leave), **deductions** (tax, social security = `ROUND(MAX(4800, MIN(17500, income))×5%, 0)`, salary advance, total deductions), net, position/note, remark (start/end dates). Total row, then extra rows (a maid, people who left).

## Sales report: Aiz's format vs ours

**Aiz's format** is the raw Loyverse «Receipts» export:
- One file per day, `<Month> 26/receipts-YYYY-MM-DD.xlsx`, with one sheet named `receipts-YYYY-MM-DD-YYYY-MM-DD`.
- For March, April and May there is also `<Month> 26 sales report.xlsx`: the same export for the whole month on one sheet, `receipts-YYYY-MM-01-YYYY-MM-<last>`.
- 19 columns: Date (datetime), Receipt number, Receipt type, Gross sales, Discounts, Net sales, Taxes, Total collected, Cost of goods, Gross profit, Payment type, Description (`1 x Item, 2 x Item`), Dining option, POS, Store, Cashier name, Customer name, Customer contacts, Status (Closed / Cancelled).
- All receipts are included, also 0 ฿ and cancelled ones. There are no totals and no categories.
- Gaps: January 1–2, April 13, September 30.

**Ours** (`/workspace/accounting/loyverse-sales-2026-09.xlsx`) is a processed workbook: Summary / Daily / Zero THB / Voided & refunds / Notes, with categories and payment totals. For 1–29 September the receipt count matches Aiz exactly: 1,588 receipts = 1,565 Closed + 23 Cancelled.

**To match Aiz's format**, add an export mode to `loyverse_month.py`. Keep our workbook as an extra.
1. Write one file per day, `receipts-YYYY-MM-DD.xlsx` (sheet `receipts-YYYY-MM-DD-YYYY-MM-DD`), plus the monthly `<Month> 26 sales report.xlsx`. Put them in a folder `<Month> 26`.
2. Use exactly the 19 columns above, in that order and with the same names.
3. Include **all** receipts in one table: Closed, 0 ฿ and Cancelled, with Status `Closed` / `Cancelled` and Receipt type `Sale` / `Refund`. Do not split them into separate sheets.
4. Write Date as a real datetime in ICT (not text Date + Time).
5. Write Description as `1 x Item, 1 x Item` (not `1x Item; …`).
6. Add the missing columns: Taxes (VAT included, net×7/107 rounded), Total collected, Cost of goods, Gross profit (Net − Cost), Dining option, POS, Store, Customer contacts. Rename Employee → Cashier name and Customer → Customer name.
7. Drop our category columns and totals from this file (Summary stays in our workbook).
