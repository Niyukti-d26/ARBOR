import * as XLSX from 'xlsx';
import { PLANS, ADMIN_DATA, RECENT_CLAIMS, CITY_ZONES } from '../data/constants';

export async function exportAdminExcel(user) {
  const wb = XLSX.utils.book_new();
  const plan = PLANS.find(p => p.id === user.plan);

  // Sheet 1 — Summary
  const ws1 = XLSX.utils.aoa_to_sheet([
    ["ARBOR — Admin Dashboard Report"],
    ["Generated on", new Date().toLocaleString("en-IN")],
    [],
    ["PLATFORM OVERVIEW"],
    ["Metric", "Value"],
    ["Total Registered Users",   ADMIN_DATA.totalUsers],
    ["Active Today",             ADMIN_DATA.activeToday],
    ["Active Claims",            ADMIN_DATA.activeClaims],
    ["Total Paid This Week (₹)", ADMIN_DATA.paidThisWeek],
    ["Fraud Alerts",             ADMIN_DATA.fraudAlerts],
    ["Avg Trust Score (/100)",   ADMIN_DATA.avgTrustScore],
    [],
    ["PLAN DISTRIBUTION"],
    ["Plan", "Users", "% Share"],
    ["Starter",  3842, 30],
    ["Standard", 6424, 50],
    ["Pro",      2581, 20],
    ["TOTAL", 12847, "100%"],
  ]);
  ws1["!cols"] = [{ wch:34 }, { wch:22 }, { wch:14 }];
  XLSX.utils.book_append_sheet(wb, ws1, "Summary");

  // Sheet 2 — Claims
  const ws2 = XLSX.utils.aoa_to_sheet([
    ["#","Worker","City","Zone","Trigger","Amount","Status","AI Score","Plan","Date"],
    ...RECENT_CLAIMS.map((c, i) => [i+1, c.user, c.city, c.zone, c.trigger, c.amount, c.status, c.aiScore, c.plan, c.date]),
  ]);
  ws2["!cols"] = [{ wch:4 },{ wch:14 },{ wch:12 },{ wch:18 },{ wch:18 },{ wch:10 },{ wch:10 },{ wch:10 },{ wch:12 },{ wch:12 }];
  XLSX.utils.book_append_sheet(wb, ws2, "Claims");

  // Sheet 3 — Worker Profile
  const ws3 = XLSX.utils.aoa_to_sheet([
    ["ARBOR — Worker Profile"],
    [],
    ["Field", "Value"],
    ["Name",            user.name],
    ["Platform",        user.platform],
    ["City",            user.city],
    ["Zone",            user.zone],
    ["Avg Daily Income",user.avgIncome],
    ["Active Plan",     plan?.name],
    ["Weekly Premium",  plan?.price],
    ["Weekly Cap",      plan?.cap],
    ["Trust Score",     user.trustScore],
  ]);
  ws3["!cols"] = [{ wch:28 }, { wch:22 }];
  XLSX.utils.book_append_sheet(wb, ws3, "Worker Profile");

  // Sheet 4 — Zone Risk Map
  const ws4 = XLSX.utils.aoa_to_sheet([
    ["City", "Zone", "Risk Level", "Flood Prone", "Primary Trigger"],
    ...Object.entries(CITY_ZONES).flatMap(([city, zones]) =>
      zones.map(z => [city, z.name || z, z.flood ? "High" : "Low", z.flood ? "Yes" : "No", z.flood ? "Heavy Rain / Flood" : "Heat / Platform"])
    ),
  ]);
  ws4["!cols"] = [{ wch:14 },{ wch:24 },{ wch:12 },{ wch:12 },{ wch:22 }];
  XLSX.utils.book_append_sheet(wb, ws4, "Zone Risk Map");

  XLSX.writeFile(wb, "ARBOR_AdminReport.xlsx");
}
