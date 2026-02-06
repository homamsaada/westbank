import React, { useState, useEffect, useRef, useMemo } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend, ComposedChart } from "recharts";

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error("Dashboard Error:", error, info); }
  render() {
    if (this.state.hasError) {
      return (<div style={{ padding: 40, fontFamily: "monospace", background: "#fee", color: "#900", minHeight: "100vh" }}>
        <h2>⚠️ Dashboard Error</h2>
        <pre style={{ whiteSpace: "pre-wrap", marginTop: 20 }}>{String(this.state.error)}</pre>
        <pre style={{ whiteSpace: "pre-wrap", marginTop: 10, fontSize: 12, color: "#666" }}>{this.state.error?.stack}</pre>
      </div>);
    }
    return this.props.children;
  }
}

// ===== PALESTINIAN COLOR THEME =====
const COLORS = {
  black: "#1a1a2e",
  red: "#c0392b",
  redLight: "#e74c3c",
  redDark: "#922b21",
  green: "#1e8449",
  greenLight: "#27ae60",
  greenDark: "#145a32",
  white: "#fafafa",
  cream: "#f5f0e8",
  gold: "#d4a017",
  goldLight: "#f0c040",
  gray: {
    50: "#f8f9fa",
    100: "#f1f3f5",
    200: "#e9ecef",
    300: "#dee2e6",
    400: "#ced4da",
    500: "#adb5bd",
    600: "#868e96",
    700: "#495057",
    800: "#343a40",
    900: "#212529",
  },
  accent: {
    olive: "#6b7b3a",
    earth: "#8b6f47",
    sky: "#2980b9",
    danger: "#c0392b",
    warning: "#d4a017",
    success: "#1e8449",
  },
};

const CHART_COLORS = ["#c0392b", "#1e8449", "#1a1a2e", "#d4a017", "#2980b9", "#8b6f47", "#6b7b3a", "#e74c3c"];

// ===== STUDY DATA (Extracted from actual documents) =====
const STUDY_DATA = {
  title: { ar: "58 عامًا من الاستيطان", en: "58 Years of Settlement" },
  subtitle: { ar: "التوثيق الكمّي الشامل (1967-2025)", en: "Comprehensive Quantitative Documentation (1967-2025)" },

  kpis: [
    { id: "settlers", value: "750,000+", label: { ar: "مستوطن", en: "Settlers" }, icon: "👥", change: "+70x", changeLabel: { ar: "منذ 1967", en: "since 1967" }, color: COLORS.red, source: "Peace Now 2025" },
    { id: "cost", value: "$71.6B", label: { ar: "التكلفة الإجمالية", en: "Total Cost" }, icon: "💰", change: "48.5-71.6", changeLabel: { ar: "مليار دولار", en: "billion USD" }, color: COLORS.greenDark, source: "CH2-S1-1.1" },
    { id: "resolutions", value: "200+", label: { ar: "قرار دولي", en: "Int'l Resolutions" }, icon: "⚖️", change: "0%", changeLabel: { ar: "نسبة التنفيذ", en: "implemented" }, color: COLORS.black, source: "CH1-S2-2.1" },
    { id: "checkpoints", value: "849", label: { ar: "حاجز وعائق", en: "Checkpoints" }, icon: "🚧", change: "+32%", changeLabel: { ar: "بعد 7 أكتوبر", en: "after Oct 7" }, color: COLORS.redDark, source: "CH3-S1-1.1" },
    { id: "wall", value: "712 km", label: { ar: "جدار الفصل", en: "Separation Wall" }, icon: "🧱", change: "85%", changeLabel: { ar: "داخل الضفة", en: "inside WB" }, color: COLORS.gray[800], source: "CH3-S1-1.2" },
    { id: "ratio", value: "1:8", label: { ar: "نسبة الإنفاق للخسائر", en: "Spend:Loss Ratio" }, icon: "⚖️", change: "$1 → $8", changeLabel: { ar: "خسائر فلسطينية", en: "Palestinian loss" }, color: COLORS.accent.danger, source: "CH2-S2-2.8" },
    { id: "trees", value: "800,000+", label: { ar: "شجرة زيتون مقتلعة", en: "Olive Trees Uprooted" }, icon: "🫒", change: "52,300", changeLabel: { ar: "بعد 7 أكتوبر فقط", en: "after Oct 7 only" }, color: COLORS.accent.olive, source: "CH2-S2-2.3" },
    { id: "violence", value: "12,000+", label: { ar: "حادثة عنف استيطاني", en: "Settler Violence" }, icon: "⚠️", change: "+451%", changeLabel: { ar: "في عقد واحد", en: "in one decade" }, color: COLORS.redLight, source: "CH3-S2-2.1" },
    { id: "lifetimeLoss", value: "13,200", label: { ar: "حياة بشرية ضائعة على الحواجز", en: "Human Lives Lost at Checkpoints" }, icon: "⏳", change: "8.1B hrs", changeLabel: { ar: "ساعة انتظار تراكمية", en: "cumulative waiting hours" }, color: COLORS.accent.earth, source: "CH3-S1-1.1" },
  ],

  settlersGrowth: [
    { year: 1967, settlers: 0, phase: "التأسيس" },
    { year: 1970, settlers: 1500, phase: "التأسيس" },
    { year: 1977, settlers: 5000, phase: "التأسيس" },
    { year: 1980, settlers: 20000, phase: "التوسع" },
    { year: 1983, settlers: 35000, phase: "التوسع" },
    { year: 1987, settlers: 65000, phase: "الانتفاضة 1" },
    { year: 1990, settlers: 90000, phase: "الانتفاضة 1" },
    { year: 1993, settlers: 116000, phase: "أوسلو" },
    { year: 1994, settlers: 130000, phase: "أوسلو" },
    { year: 1995, settlers: 145000, phase: "أوسلو" },
    { year: 1996, settlers: 158000, phase: "أوسلو" },
    { year: 1997, settlers: 170000, phase: "أوسلو" },
    { year: 1998, settlers: 180000, phase: "أوسلو" },
    { year: 1999, settlers: 195000, phase: "أوسلو" },
    { year: 2000, settlers: 211000, phase: "الانتفاضة 2" },
    { year: 2002, settlers: 230000, phase: "الانتفاضة 2" },
    { year: 2005, settlers: 260000, phase: "التوسع المستمر" },
    { year: 2008, settlers: 310000, phase: "التوسع المستمر" },
    { year: 2010, settlers: 350000, phase: "التوسع المستمر" },
    { year: 2013, settlers: 400000, phase: "التوسع المستمر" },
    { year: 2015, settlers: 450000, phase: "التوسع المستمر" },
    { year: 2017, settlers: 500000, phase: "التوسع المستمر" },
    { year: 2019, settlers: 600000, phase: "التوسع المستمر" },
    { year: 2021, settlers: 680000, phase: "التوسع المستمر" },
    { year: 2023, settlers: 750000, phase: "التسارع" },
    { year: 2025, settlers: 770000, phase: "التسارع" },
  ],

  phases: [
    { id: 1, period: "1967-1977", name: { ar: "التأسيس الأولي", en: "Initial Foundation" }, start: 0, end: 5000, growth: "∞", event: { ar: "القرار 242، احتلال عسكري", en: "Resolution 242, Military Occupation" }, color: COLORS.gray[600] },
    { id: 2, period: "1977-1987", name: { ar: "التوسع الاستراتيجي", en: "Strategic Expansion" }, start: 5000, end: 65000, growth: "1,300%", event: { ar: "خطة دروبلس، حكومة الليكود", en: "Drobles Plan, Likud Government" }, color: COLORS.gold },
    { id: 3, period: "1987-1993", name: { ar: "الانتفاضة الأولى", en: "First Intifada" }, start: 65000, end: 116000, growth: "78%", event: { ar: "استمرار البناء رغم المقاومة", en: "Building despite resistance" }, color: COLORS.accent.earth },
    { id: 4, period: "1993-2000", name: { ar: "مفارقة أوسلو", en: "Oslo Paradox" }, start: 116000, end: 211000, growth: "82%", event: { ar: "عملية السلام، نظام ABC", en: "Peace Process, ABC System" }, color: COLORS.accent.sky },
    { id: 5, period: "2000-2005", name: { ar: "الانتفاضة الثانية والجدار", en: "Second Intifada & Wall" }, start: 211000, end: 260000, growth: "23%", event: { ar: "بناء الجدار، حكم محكمة العدل", en: "Wall Construction, ICJ Ruling" }, color: COLORS.redDark },
    { id: 6, period: "2005-2023", name: { ar: "التوسع المستمر", en: "Continuous Expansion" }, start: 260000, end: 750000, growth: "188%", event: { ar: "الثبات عبر جميع الحكومات", en: "Constant across all governments" }, color: COLORS.greenDark },
    { id: 7, period: "2023-2025", name: { ar: "التسارع الدراماتيكي", en: "Dramatic Acceleration" }, start: 750000, end: 770000, growth: "قياسي", event: { ar: "59 بؤرة، 24,258 دونم مصادرة", en: "59 outposts, 24,258 dunams seized" }, color: COLORS.red },
  ],

  spending: [
    { category: { ar: "الإنفاق المباشر المُعلن", en: "Declared Direct" }, min: 13.5, max: 15.6, pct: "21-28%" },
    { category: { ar: "التكاليف الأمنية", en: "Security Costs" }, min: 20, max: 30, pct: "35-53%" },
    { category: { ar: "الطرق الالتفافية", en: "Bypass Roads" }, min: 5, max: 8, pct: "9-14%" },
    { category: { ar: "القدس الشرقية", en: "East Jerusalem" }, min: 5, max: 10, pct: "9-18%" },
    { category: { ar: "دائرة الاستيطان", en: "Settlement Division" }, min: 2, max: 3, pct: "4-5%" },
    { category: { ar: "الإعفاءات الضريبية", en: "Tax Exemptions" }, min: 3, max: 5, pct: "5-9%" },
  ],

  spendingTimeline: [
    { period: "1967-1977", label: { ar: "حقبة العمل", en: "Labor Era" }, annual: 50, cumulative: 0.5 },
    { period: "1977-1992", label: { ar: "ثورة الليكود", en: "Likud Revolution" }, annual: 250, cumulative: 3.75 },
    { period: "1993-2000", label: { ar: "مفارقة أوسلو", en: "Oslo Paradox" }, annual: 197, cumulative: 1.58 },
    { period: "2000-2009", label: { ar: "الانتفاضة والجدار", en: "Intifada & Wall" }, annual: 225, cumulative: 2.25 },
    { period: "2009-2016", label: { ar: "نتنياهو-أوباما", en: "Netanyahu-Obama" }, annual: 227, cumulative: 1.82 },
    { period: "2017-2022", label: { ar: "حقبة ترامب", en: "Trump Era" }, annual: 457, cumulative: 2.74 },
    { period: "2023-2025", label: { ar: "الائتلاف اليميني", en: "Far-Right Coalition" }, annual: 633, cumulative: 1.9 },
  ],

  checkpointsTimeline: [
    { year: 2004, count: 709 }, { year: 2005, count: 555 }, { year: 2006, count: 598 },
    { year: 2007, count: 623 }, { year: 2008, count: 708 }, { year: 2009, count: 725 },
    { year: 2010, count: 599 }, { year: 2012, count: 636 }, { year: 2014, count: 641 },
    { year: 2016, count: 601 }, { year: 2018, count: 678 }, { year: 2020, count: 705 },
    { year: 2023, count: 645 }, { year: 2025, count: 849 },
  ],

  violenceData: [
    { year: 2006, incidents: 263 }, { year: 2010, incidents: 263 }, { year: 2014, incidents: 263 },
    { year: 2020, incidents: 358 }, { year: 2021, incidents: 500 }, { year: 2022, incidents: 852 },
    { year: 2023, incidents: 1291 }, { year: 2024, incidents: 2370 },
  ],

  chapters: [
    {
      id: "ch1", bab: 1, title: { ar: "التأسيس والإطار", en: "Foundation & Framework" },
      sections: [
        { id: "ch1-s1", title: { ar: "التطور التاريخي", en: "Historical Development" }, items: [
          { id: "1.1", title: { ar: "المراحل السبع للاستيطان", en: "Seven Phases of Settlement" }, summary: {
            ar: "من صفر مستوطن عام 1967 إلى أكثر من 750 ألف اليوم عبر سبع مراحل: التأسيس الأولي (0→5 آلاف)، التوسع الاستراتيجي مع خطة دروبلس (5→65 ألف، +1,300%)، الانتفاضة الأولى (65→116 ألف)، مفارقة أوسلو (116→211 ألف، +82% خلال \"السلام\")، الانتفاضة الثانية والجدار (211→260 ألف)، التوسع المستمر عبر جميع الحكومات (260→750 ألف، +188%)، والتسارع الدراماتيكي بعد 2023 حيث أقيمت 59 بؤرة في سنة واحدة تعادل 27 سنة سابقة مجتمعة.",
            en: "From zero settlers in 1967 to over 750,000 today across seven phases: initial establishment (0→5K), strategic expansion with the Drobles Plan (5K→65K, +1,300%), First Intifada (65K→116K), Oslo Paradox (116K→211K, +82% during 'peace'), Second Intifada & Wall (211K→260K), continuous expansion across all governments (260K→750K, +188%), and the dramatic acceleration post-2023 with 59 outposts in one year equaling 27 previous years combined."
          }},
          { id: "1.2", title: { ar: "مفارقة أوسلو", en: "Oslo Paradox" }, summary: {
            ar: "أسرع نمو استيطاني في التاريخ وقع خلال \"عملية السلام\": تضاعف المستوطنون من 110,000 إلى 203,000 (+85%) في 7 سنوات فقط. أوسلو الثانية (28 سبتمبر 1995) قسّمت الضفة إلى مناطق A/B/C واضعةً 60% تحت سيطرة إسرائيلية \"مؤقتة\" أصبحت دائمة منذ 30 عامًا. خلال المفاوضات: 17,000 وحدة سكنية جديدة، 400 كم طرق التفافية، وانخفاض موافقات البناء الفلسطينية من 5% إلى أقل من 1% بينما حصلت المستوطنات على 60-70% موافقة.",
            en: "The fastest settlement growth in history occurred during the 'peace process': settlers nearly doubled from 110,000 to 203,000 (+85%) in just 7 years. Oslo II (Sept 28, 1995) divided the West Bank into Areas A/B/C, placing 60% under 'temporary' Israeli control—now permanent for 30 years. During negotiations: 17,000 new housing units, 400km bypass roads, Palestinian building permits dropped from 5% to below 1% while settlements received 60-70% approval."
          }},
          { id: "1.3", title: { ar: "التصعيد بعد 7 أكتوبر", en: "Escalation After Oct 7" }, summary: {
            ar: "خلال 20 شهرًا فقط بعد أكتوبر 2023: الحواجز من 642 إلى 849 (+32%)، 59 بؤرة جديدة (8.4 أضعاف المعدل التاريخي)، 10,503 وحدات سكنية معتمدة في 3 أشهر (4 أضعاف المعدل)، البطالة من 12.9% إلى 34.9%، الفقر من 12% إلى 28%، عنف المستوطنين من 3 إلى 7 حوادث يوميًا، 18,000 معتقل، و24,258 دونمًا مصادَرة تعادل نصف كل ما صودر منذ أوسلو.",
            en: "In just 20 months after October 2023: checkpoints rose from 642 to 849 (+32%), 59 new outposts (8.4x historical average), 10,503 housing units approved in 3 months (4x normal), unemployment surged from 12.9% to 34.9%, poverty from 12% to 28%, settler violence from 3 to 7 incidents/day, 18,000 arrests, and 24,258 dunams confiscated—half of all confiscations since Oslo."
          }},
        ]},
        { id: "ch1-s2", title: { ar: "الإطار القانوني", en: "Legal Framework" }, items: [
          { id: "2.1", title: { ar: "القرارات الدولية الأساسية", en: "Key International Resolutions" }, summary: {
            ar: "أكثر من 200 قرار دولي محدد عن الاستيطان عبر 58 عامًا: 6 قرارات مباشرة من مجلس الأمن، 58 قرارًا تراكميًا من الجمعية العامة، 3 أحكام من محكمة العدل الدولية. القرار 242 (1967) طالب بالانسحاب، 465 (1980) أعلن عدم الشرعية، 2334 (2016) وصف المستوطنات بـ\"انتهاك صارخ\"، وحكم 2024 أعلن الاحتلال نفسه \"غير قانوني\". نسبة التنفيذ: صفر. حماية أمريكية بأكثر من 50 فيتو.",
            en: "Over 200 specific international resolutions on settlements across 58 years: 6 direct Security Council resolutions, 58 cumulative General Assembly resolutions, 3 ICJ rulings. Resolution 242 (1967) demanded withdrawal, 465 (1980) declared illegality, 2334 (2016) called settlements a 'flagrant violation,' and the 2024 ruling declared the occupation itself 'illegal.' Implementation rate: zero. US protection via 50+ vetoes."
          }},
          { id: "2.2", title: { ar: "التصنيف القانوني للأراضي", en: "Legal Land Classification" }, summary: {
            ar: "أوسلو الثانية (1995) قسّمت الضفة: المنطقة A (18% - سيطرة فلسطينية)، المنطقة B (22% - مشتركة)، المنطقة C (60% - سيطرة إسرائيلية كاملة). كان التقسيم \"مؤقتًا\" لخمس سنوات، لكن 30 عامًا مرّت دون تغيير. في المنطقة C: 99% من طلبات البناء الفلسطينية مرفوضة، بينما تحصل المستوطنات على موافقة شبه تلقائية. إسرائيل تتحكم بالتخطيط والبناء والموارد في 60% من الضفة.",
            en: "Oslo II (1995) divided the West Bank: Area A (18% - Palestinian control), Area B (22% - shared), Area C (60% - full Israeli control). This was 'temporary' for 5 years, but 30 years have passed unchanged. In Area C: 99% of Palestinian building permits rejected while settlements get near-automatic approval. Israel controls planning, construction, and resources in 60% of the West Bank."
          }},
        ]},
      ]
    },
    {
      id: "ch2", bab: 2, title: { ar: "الاقتصاد الاستيطاني", en: "Settlement Economy" },
      sections: [
        { id: "ch2-s1", title: { ar: "الإنفاق الإسرائيلي", en: "Israeli Expenditure" }, items: [
          { id: "1.1", title: { ar: "الإنفاق الحكومي", en: "Government Spending" }, summary: {
            ar: "الإنفاق المباشر المُعلن بلغ رقمًا قياسيًا: 542 مليون دولار عام 2023 (+52% بعد أكتوبر). التكلفة الحقيقية السنوية تتجاوز 2 مليار دولار. الإجمالي التراكمي التاريخي: 48.5-71.6 مليار دولار. 25% من ميزانية النقل الوطنية تخدم 2% من السكان. المستوطن يحصل على دعم يعادل 2.65 ضعف المواطن الإسرائيلي. خطة خماسية للطرق بقيمة 1.9 مليار دولار (2024-2029). التعتيم المتعمد يوزّع الإنفاق عبر 10 وزارات لإخفاء الحجم الحقيقي.",
            en: "Declared direct spending hit a record $542M in 2023 (+52% after October). True annual cost exceeds $2B. Historical cumulative total: $48.5-71.6B. 25% of the national transport budget serves 2% of the population. Each settler receives 2.65x the support of a regular Israeli citizen. A $1.9B five-year road plan (2024-2029). Deliberate obfuscation distributes spending across 10 ministries to hide the true scale."
          }},
          { id: "1.2", title: { ar: "المقارنات الصادمة", en: "Shocking Comparisons" }, summary: {
            ar: "كل مستوطن يكلّف الخزينة 2.65 ضعف المواطن الإسرائيلي. طريق حوارة الالتفافي: 95 مليون دولار لخدمة 8,000 مستوطن (7.5 كم فقط = 13 مليون$/كم). الطالب في المستوطنة يحصل على 2,160$ سنويًا مقابل 1,080$ داخل الخط الأخضر. قروض إسكان بفائدة صفرية مقابل 4-6% في السوق. إعفاء ضريبي للشركات: 6% مقابل 12-25% داخل إسرائيل.",
            en: "Each settler costs the treasury 2.65x a regular Israeli citizen. Huwara bypass road: $95M serving 8,000 settlers (7.5km = $13M/km). Students in settlements get $2,160/year vs $1,080 inside the Green Line. Housing loans at 0% interest vs 4-6% market rate. Corporate tax breaks: 6% vs 12-25% inside Israel."
          }},
          { id: "1.3", title: { ar: "القطاعات الاقتصادية", en: "Economic Sectors" }, summary: {
            ar: "خمسة قطاعات رئيسية: الزراعة الاستيطانية تسيطر على أخصب أراضي غور الأردن بإيرادات 500+ مليون دولار سنويًا. 19+ منطقة صناعية (أبرزها باركان وعطروت) تشغّل عمالة فلسطينية رخيصة. السياحة تستغل المواقع الفلسطينية. التوظيف \"طفيلي\": 62% من المستوطنين يعملون داخل الخط الأخضر عبر شبكة طرق ممتازة. خطط لتحويل المستوطنات الكبرى لمدن مكتفية ذاتيًا.",
            en: "Five key sectors: settlement agriculture controls the most fertile Jordan Valley lands with $500M+ annual revenue. 19+ industrial zones (notably Barkan, Atarot) employ cheap Palestinian labor. Tourism exploits Palestinian sites. 'Parasitic' employment: 62% of settlers work inside the Green Line via excellent road networks. Plans to transform major settlements into self-sufficient cities."
          }},
          { id: "1.4", title: { ar: "الدعم الأمريكي", en: "US Support" }, summary: {
            ar: "الولايات المتحدة أكبر داعم مالي: 3.8 مليار دولار مساعدات عسكرية سنوية تحرر الميزانية الإسرائيلية للإنفاق على الاستيطان. خصمت الخزانة الأمريكية 1.085 مليار$ من ضمانات القروض (2003-2005) اعترافًا بالإنفاق الاستيطاني. أكثر من 50 فيتو في مجلس الأمن. إدارة ترامب اعترفت بالمستوطنات واعتبرتها \"غير مخالفة للقانون الدولي\" عام 2019.",
            en: "The US is the largest financial backer: $3.8B in annual military aid frees up Israel's budget for settlement spending. The US Treasury deducted $1.085B from loan guarantees (2003-2005) acknowledging settlement spending. 50+ Security Council vetoes. The Trump administration recognized settlements as 'not inconsistent with international law' in 2019."
          }},
          { id: "1.5", title: { ar: "التصعيد الحالي", en: "Current Escalation" }, summary: {
            ar: "إنفاق قياسي 542 مليون$ (2023)، 59 بؤرة في 2024 وحدها، 10,503 وحدات في أول 3 أشهر من 2025. سموتريتش أنشأ إدارة استيطانية منفصلة في وزارة الدفاع (فبراير 2023)، وأول تمويل علني للبؤر غير القانونية (20.5 مليون$). اجتماعات مجلس التخطيط أسبوعيًا بدل فصليًا. تسجيل صوتي مسرّب (9 يونيو 2024) كشف استراتيجية ضم فعلي: \"حتى لا يقولوا إننا ننفذ ضمًا هنا\".",
            en: "Record spending of $542M (2023), 59 outposts in 2024 alone, 10,503 units approved in Q1 2025. Smotrich created a separate settlement administration in the Defense Ministry (Feb 2023), first-ever public funding for illegal outposts ($20.5M). Planning council meetings shifted from quarterly to weekly. Leaked audio (June 9, 2024) revealed de facto annexation strategy: 'so they won't say we're implementing annexation here.'"
          }},
        ]},
        { id: "ch2-s2", title: { ar: "الخسائر الفلسطينية", en: "Palestinian Losses" }, items: [
          { id: "2.1", title: { ar: "مصادرة الأراضي", en: "Land Confiscation" }, summary: {
            ar: "أكثر من 2 مليون دونم صودرت منذ 1967 عبر آليات متعددة: إعلان \"أراضي دولة\"، مصادرة لأغراض \"عسكرية\"، وأوامر إغلاق. في 2024 وحده: 24,258 دونمًا صودرت - 10 أضعاف المعدل التاريخي ونصف كل ما صودر منذ أوسلو. سعر الأرض المصادرة: 25-40 $/م². القيمة التراكمية للأراضي المصادرة كأصول: 50-80 مليار دولار.",
            en: "Over 2 million dunams confiscated since 1967 through multiple mechanisms: declaring 'state land,' military seizure, and closure orders. In 2024 alone: 24,258 dunams seized—10x the historical average and half of all confiscations since Oslo. Confiscated land value: $25-40/m². Cumulative asset value: $50-80 billion."
          }},
          { id: "2.2", title: { ar: "هدم المنازل", en: "Home Demolitions" }, summary: {
            ar: "59,367 مبنى فلسطينيًا هُدم منذ 1967 وفق ICAHD. في 2024: 1,768 مبنى غير سكني هُدم (4.7 يوميًا). معدل رفض تراخيص البناء الفلسطينية: 99%. التكلفة التراكمية: 24-30 مليار دولار. الهدم لا يقتصر على المنازل بل يشمل المدارس والعيادات وخزانات المياه والطرق الزراعية، مما يدمّر البنية التحتية للحياة الفلسطينية بشكل ممنهج.",
            en: "59,367 Palestinian structures demolished since 1967 per ICAHD. In 2024: 1,768 non-residential structures demolished (4.7/day). Palestinian building permit rejection rate: 99%. Cumulative cost: $24-30 billion. Demolitions extend beyond homes to schools, clinics, water tanks, and agricultural roads, systematically destroying Palestinian life infrastructure."
          }},
          { id: "2.3", title: { ar: "الخسائر الزراعية", en: "Agricultural Losses" }, summary: {
            ar: "أكثر من 800,000 شجرة زيتون اقتُلعت منذ 1967. في 2024 وحده: 52,300 شجرة دُمرت (7-8 أضعاف المعدل). الخسائر السنوية: 704 مليون$ من قيود المنطقة C + 55 مليون$ من اقتلاع الأشجار. موسم 2023: 96,000 دونم لم تُحصد (17% من أراضي الزيتون) بخسارة 10 ملايين$. القطاع الذي كان يشغّل 100,000 عائلة يواجه كارثة وجودية.",
            en: "Over 800,000 olive trees uprooted since 1967. In 2024 alone: 52,300 trees destroyed (7-8x the average). Annual losses: $704M from Area C restrictions + $55M from tree uprooting. 2023 season: 96,000 dunams unharvested (17% of olive lands) losing $10M. A sector that employed 100,000 families now faces existential crisis."
          }},
          { id: "2.4", title: { ar: "الموارد المائية", en: "Water Resources" }, summary: {
            ar: "إسرائيل تسيطر على 85% من الموارد المائية الفلسطينية. الفلسطيني يحصل على 73 لترًا/يوم مقابل 247 لترًا للإسرائيلي (الحد الأدنى لمنظمة الصحة: 100 لتر). المستوطن يستهلك 4-6 أضعاف الفلسطيني. شركة ميكوروت الإسرائيلية تبيع الفلسطينيين مياههم المسروقة. تدمير ممنهج للآبار والصهاريج وشبكات الري.",
            en: "Israel controls 85% of Palestinian water resources. Palestinians receive 73 liters/day vs 247 for Israelis (WHO minimum: 100 liters). Settlers consume 4-6x more than Palestinians. Israel's Mekorot company sells Palestinians their own stolen water. Systematic destruction of wells, cisterns, and irrigation networks."
          }},
          { id: "2.5", title: { ar: "الأعمار على الحواجز", en: "Lives Lost at Checkpoints" }, summary: {
            ar: "8.1 مليار ساعة انتظار تراكمية (1967-2025) تعادل 13,200 حياة بشرية كاملة (75 سنة لكل حياة). التكلفة الاقتصادية: 39.2 مليار دولار. 5 ملايين فلسطيني × ساعة انتظار يومية × 25 سنة من نظام الحواجز المكثف. 849 حاجزًا حاليًا بعد زيادة 32% منذ أكتوبر 2023.",
            en: "8.1 billion cumulative waiting hours (1967-2025) equivalent to 13,200 full human lives (75 years each). Economic cost: $39.2 billion. 5 million Palestinians × 1 hour daily × 25 years of intensive checkpoint systems. Currently 849 checkpoints after a 32% increase since October 2023."
          }},
          { id: "2.6", title: { ar: "الخسائر الاقتصادية", en: "Economic Losses" }, summary: {
            ar: "المنطقة C: 3.4 مليار$ خسائر سنوية (35% من الناتج المحلي) و50+ مليار$ تراكميًا (2000-2020). بروتوكول باريس: 84.7 مليار$ خسائر تراكمية من القيود النقدية والمقاصة. المعابر التجارية: تأخيرات تكلّف ملايين سنويًا. المحاجر: فلسطين ممنوعة من فتح محاجر جديدة منذ 31 عامًا بينما إسرائيل تستخرج 285 مليون شيكل. البحر الميت: 918 مليون$ خسائر سنوية.",
            en: "Area C: $3.4B annual losses (35% of GDP) and $50B+ cumulative (2000-2020). Paris Protocol: $84.7B cumulative losses from monetary and clearance restrictions. Trade crossings: delays costing millions annually. Quarries: Palestinians banned from new quarries for 31 years while Israel extracts 285M shekels. Dead Sea: $918M annual losses."
          }},
          { id: "2.7", title: { ar: "التقدير الإجمالي", en: "Total Estimate" }, summary: {
            ar: "الخسائر الإجمالية: 357-450 مليار$ - أكثر من ضعف تقديرات المنظمات الدولية (150-200 مليار$). الفارق (207-250 مليار$) يشمل خسائر لم تُحسب: بروتوكول باريس (84.7 مليار$)، الأراضي كأصول (50-80 مليار$)، الأعمار البشرية (39.2 مليار$)، المنازل المهدومة (24-30 مليار$). عام 2024: خسائر 7.1 مليار$ مع انكماش 26.9% - أي 19 مليون$ يوميًا.",
            en: "Total losses: $357-450B—more than double international estimates ($150-200B). The gap ($207-250B) includes uncounted losses: Paris Protocol ($84.7B), land as assets ($50-80B), human lifetimes ($39.2B), demolished homes ($24-30B). In 2024: $7.1B in losses with 26.9% contraction—$19M daily."
          }},
          { id: "2.8", title: { ar: "المعادلة 1:8", en: "The 1:8 Equation" }, summary: {
            ar: "كل دولار أنفقته إسرائيل على الاستيطان أنتج 8 دولارات خسائر فلسطينية: من 40-60 مليار إنفاق إلى 300-400 مليار خسائر. المستوطنات ساهمت بـ628 مليار$ للاقتصاد الإسرائيلي (2000-2020) أي 227% من الناتج الفلسطيني. فجوة الدخل اتسعت من 10:1 في التسعينيات إلى 14:1 عام 2022 (54,900$ مقابل 3,800$). ليس احتلالًا عسكريًا فحسب، بل نظام لنقل الثروة بشكل ممنهج.",
            en: "Every dollar Israel spent on settlements produced $8 in Palestinian losses: from $40-60B spent to $300-400B in losses. Settlements contributed $628B to Israel's economy (2000-2020), equaling 227% of Palestinian GDP. The income gap widened from 10:1 in the 1990s to 14:1 in 2022 ($54,900 vs $3,800). Not just military occupation, but a systematic wealth transfer system."
          }},
        ]},
      ]
    },
    {
      id: "ch3", bab: 3, title: { ar: "البنية التحتية للسيطرة", en: "Infrastructure of Control" },
      sections: [
        { id: "ch3-s1", title: { ar: "الأدوات الجغرافية", en: "Geographic Tools" }, items: [
          { id: "1.1", title: { ar: "الحواجز", en: "Checkpoints" }, summary: {
            ar: "849 حاجزًا حاليًا (+32% منذ أكتوبر 2023). أنواعها: حواجز دائمة مأهولة، بوابات حديدية، سواتر ترابية، حواجز طيّارة مفاجئة. الحاجز الواحد يؤخر آلاف الفلسطينيين يوميًا. شبكة الحواجز تقطّع الضفة إلى 227 \"جزيرة\" منفصلة. التأخير اليومي يكلّف الاقتصاد الفلسطيني ملايين الدولارات سنويًا ويحول التنقل بين المدن إلى رحلات عذاب.",
            en: "849 checkpoints currently (+32% since October 2023). Types: permanent staffed, iron gates, earth mounds, surprise flying checkpoints. Each delays thousands of Palestinians daily. The network fragments the West Bank into 227 separate 'islands.' Daily delays cost millions annually and transform intercity travel into ordeals."
          }},
          { id: "1.2", title: { ar: "جدار الفصل", en: "Separation Wall" }, summary: {
            ar: "712 كيلومترًا - أكثر من ضعف الخط الأخضر (320 كم). 85% من مساره داخل الأراضي الفلسطينية وليس على الحدود. يعزل 9.4% من الضفة الغربية (526,677 دونمًا). محكمة العدل الدولية حكمت بعدم قانونيته (2004) بأغلبية 14-1 وطالبت بتفكيكه - نسبة التنفيذ: 0%. قلقيلية (41,000 نسمة) محاصرة من ثلاث جهات بمخرج واحد عبر نفق. معدل الموافقة على تصاريح المنطقة العازلة انهار من 76% إلى 27%.",
            en: "712 kilometers—more than double the Green Line (320km). 85% runs inside Palestinian territory, not along the border. Isolates 9.4% of the West Bank (526,677 dunams). The ICJ ruled it illegal (2004) by 14-1 and demanded dismantlement—0% implemented. Qalqilya (41,000 people) encircled on three sides with one tunnel exit. Seam zone permit approvals collapsed from 76% to 27%."
          }},
          { id: "1.3", title: { ar: "الطرق الالتفافية", en: "Bypass Roads" }, summary: {
            ar: "700-800 كيلومتر من الطرق الالتفافية تربط المستوطنات بإسرائيل حصريًا. تستحوذ على 25% من ميزانية النقل الوطنية لخدمة 2% من السكان. خطة خماسية: 1.9 مليار$ (2024-2029). الطريق 60: 538 مليون$. طريق حوارة: 95 مليون$ لـ7.5 كم فقط. 139 طريقًا غير قانوني بطول 116 كم بناها مستوطنون بتمويل حكومي (2023-2024). الطرق أداة ضم جغرافي لا بنية تحتية فحسب.",
            en: "700-800km of bypass roads connecting settlements exclusively to Israel. Consume 25% of national transport budget serving 2% of the population. Five-year plan: $1.9B (2024-2029). Route 60: $538M. Huwara bypass: $95M for just 7.5km. 139 illegal roads spanning 116km built by settlers with government funding (2023-2024). Roads are geographic annexation tools, not just infrastructure."
          }},
          { id: "1.4", title: { ar: "القواعد العسكرية", en: "Military Bases" }, summary: {
            ar: "شبكة واسعة من القواعد العسكرية والمعسكرات تنتشر في الضفة الغربية لحماية المستوطنات. تُصادر آلاف الدونمات تحت مسمى \"مناطق عسكرية مغلقة\" و\"مناطق إطلاق نار\". كثير من البؤر الاستيطانية بدأت كـ\"مواقع عسكرية\" ثم تحولت لمستوطنات مدنية. القواعد تفرض واقعًا أمنيًا يجعل التنقل الفلسطيني مستحيلًا في مناطق واسعة.",
            en: "An extensive network of military bases and camps across the West Bank to protect settlements. Thousands of dunams seized as 'closed military zones' and 'firing zones.' Many settlement outposts started as 'military positions' then became civilian settlements. Bases impose a security reality making Palestinian movement impossible across wide areas."
          }},
          { id: "1.5", title: { ar: "نظام التصاريح", en: "Permit System" }, summary: {
            ar: "نظام بيروقراطي معقد يتحكم بكل جانب من حياة الفلسطينيين: تصاريح تنقل، بناء، زراعة، وصول للأراضي خلف الجدار. أنواع متعددة من التصاريح لكل غرض. معدل الموافقة على تصاريح البناء: أقل من 1%. تصاريح المنطقة العازلة: انخفضت من 76% إلى 27%. النظام يخنق التنمية ويمنع الفلسطينيين من استخدام مواردهم الطبيعية.",
            en: "A complex bureaucratic system controlling every aspect of Palestinian life: permits for movement, construction, agriculture, access to land behind the wall. Multiple permit types for each purpose. Building permit approval: below 1%. Seam zone permits: dropped from 76% to 27%. The system strangles development and prevents Palestinians from accessing their natural resources."
          }},
        ]},
        { id: "ch3-s2", title: { ar: "أدوات القمع", en: "Tools of Repression" }, items: [
          { id: "2.1", title: { ar: "العنف الاستيطاني", en: "Settler Violence" }, summary: {
            ar: "12,000+ حادثة موثقة بزيادة 451% خلال عقد. بعد أكتوبر 2023: 2,370+ حادثة في 9 أشهر (9 يوميًا مقابل 3 سابقًا). 26 فلسطينيًا قُتلوا مباشرة على يد مستوطنين، 6,700+ جريح، 2,895 مهجّرًا من 69 تجمعًا. بن غفير وزّع 120,000 قطعة سلاح على المستوطنين. أنواع العنف: إطلاق نار (ثلث الحوادث)، حرق (حوّارة: 35 منزلًا و140 سيارة في ليلة واحدة)، اقتلاع 52,300 شجرة زيتون في 2024.",
            en: "12,000+ documented incidents, a 451% increase over a decade. After October 2023: 2,370+ incidents in 9 months (9/day vs 3 before). 26 Palestinians killed directly by settlers, 6,700+ injured, 2,895 displaced from 69 communities. Ben Gvir distributed 120,000 weapons to settlers. Violence types: shootings (1/3 of incidents), arson (Huwara: 35 homes, 140 cars in one night), 52,300 olive trees destroyed in 2024."
          }},
          { id: "2.2", title: { ar: "الاعتقالات", en: "Arrests" }, summary: {
            ar: "أكثر من مليون فلسطيني اعتُقل منذ 1967 - أي أن كل عائلة فلسطينية تقريبًا تأثرت. بعد أكتوبر 2023: 18,000 معتقل إضافي. الاعتقال الإداري بلا تهمة ولا محاكمة: أكثر من 3,000 معتقل حاليًا. اعتقال الأطفال: 700-1,000 طفل سنويًا، بعضهم في سن 12 عامًا. محاكم عسكرية بمعدل إدانة 99.7%. الاعتقال أداة ترهيب جماعي وليس عدالة.",
            en: "Over 1 million Palestinians arrested since 1967—virtually every Palestinian family affected. After October 2023: 18,000 additional arrests. Administrative detention without charge or trial: over 3,000 currently held. Child arrests: 700-1,000 children annually, some as young as 12. Military courts with 99.7% conviction rate. Detention is a tool of collective intimidation, not justice."
          }},
          { id: "2.3", title: { ar: "الضحايا", en: "Casualties" }, summary: {
            ar: "آلاف الشهداء الفلسطينيين في الضفة الغربية منذ 1967، بينهم مئات الأطفال. بعد أكتوبر 2023: تصاعد حاد في القتلى مع عمليات عسكرية واسعة في جنين ونابلس وطولكرم. غارات جوية استُخدمت لأول مرة في الضفة منذ عقود. الإفلات من العقاب: 96% من الشكاوى ضد الجنود تُغلق دون تحقيق.",
            en: "Thousands of Palestinian martyrs in the West Bank since 1967, including hundreds of children. After October 2023: sharp escalation with large-scale military operations in Jenin, Nablus, and Tulkarem. Airstrikes used in the West Bank for the first time in decades. Impunity: 96% of complaints against soldiers closed without investigation."
          }},
          { id: "2.4", title: { ar: "التهجير القسري", en: "Forced Displacement" }, summary: {
            ar: "أكثر من 500,000 فلسطيني هُجّروا قسريًا منذ 1967، بينهم 250,000 طفل. الآليات: هدم المنازل (59,367 مبنى)، عنف المستوطنين (2,895 مهجّرًا بعد أكتوبر 2023 من 69 تجمعًا)، أوامر الإخلاء العسكرية، مصادرة الأراضي. الخسائر الاقتصادية التراكمية للتهجير: 28 مليار$. التهجير ليس عرضيًا بل سياسة ممنهجة لتفريغ المناطق المستهدفة للتوسع الاستيطاني.",
            en: "Over 500,000 Palestinians forcibly displaced since 1967, including 250,000 children. Mechanisms: home demolitions (59,367 structures), settler violence (2,895 displaced after October 2023 from 69 communities), military eviction orders, land confiscation. Cumulative economic losses from displacement: $28B. Displacement is not incidental but systematic policy to empty areas targeted for settlement expansion."
          }},
        ]},
      ]
    },
  ],

  // === NEW CHART DATA ===
  checkpointLifetimeLoss: [
    { period: "1967-1987", periodEn: "1967-1987", hours: 0.42, cost: 0.42, event: "نقاط تفتيش بدائية", eventEn: "Primitive checkpoints" },
    { period: "1987-1993", periodEn: "1987-1993", hours: 0.38, cost: 0.58, event: "الانتفاضة الأولى", eventEn: "First Intifada" },
    { period: "1994-2000", periodEn: "1994-2000", hours: 0.90, cost: 2.15, event: "أوسلو: السلام الوهمي", eventEn: "Oslo: False peace" },
    { period: "2000-2010", periodEn: "2000-2010", hours: 2.82, cost: 7.6, event: "الانتفاضة الثانية والجدار", eventEn: "2nd Intifada & Wall" },
    { period: "2010-2023", periodEn: "2010-2023", hours: 2.77, cost: 12.45, event: "استقرار بقيود عالية", eventEn: "Stability with high restrictions" },
    { period: "2024-2025", periodEn: "2024-2025", hours: 0.85, cost: 4.68, event: "التصعيد بعد 7 أكتوبر", eventEn: "Post-Oct 7 escalation" },
  ],

  oliveVsWine: [
    { year: 1980, olivesDestroyed: 10, wineries: 0, wineValue: 0 },
    { year: 1990, olivesDestroyed: 18, wineries: 0, wineValue: 0 },
    { year: 2000, olivesDestroyed: 30, wineries: 2, wineValue: 0.5 },
    { year: 2005, olivesDestroyed: 40, wineries: 10, wineValue: 3 },
    { year: 2011, olivesDestroyed: 50, wineries: 29, wineValue: 10 },
    { year: 2015, olivesDestroyed: 55, wineries: 35, wineValue: 25 },
    { year: 2020, olivesDestroyed: 60, wineries: 50, wineValue: 40 },
    { year: 2024, olivesDestroyed: 85, wineries: 60, wineValue: 65 },
  ],

  containerJourney: [
    { category: "cost", labelAr: "التكلفة", labelEn: "Cost", pal: 3, isr: 1, unit: { ar: "× أضعاف", en: "× multiplier" } },
    { category: "time", labelAr: "وقت الانتظار", labelEn: "Wait Time", pal: 3.5, isr: 1, unit: { ar: "أيام مقابل ساعات", en: "days vs hours" } },
    { category: "inspect", labelAr: "الفحص اليدوي", labelEn: "Manual Inspection", pal: 95, isr: 5, unit: { ar: "% من الشحنات", en: "% of shipments" } },
    { category: "backtoback", labelAr: "نظام الظهر للظهر", labelEn: "Back-to-Back", pal: 100, isr: 0, unit: { ar: "% إلزامي", en: "% mandatory" } },
  ],

  settlerVsCitizen: [
    { cat: "overall", labelAr: "الدعم الحكومي الكلي", labelEn: "Total Gov. Support", settler: 2.65, citizen: 1 },
    { cat: "education", labelAr: "التعليم ($/طالب/سنة)", labelEn: "Education ($/student/yr)", settler: 2160, citizen: 1080 },
    { cat: "roads", labelAr: "استثمار الطرق", labelEn: "Road Investment", settler: 12.5, citizen: 1 },
    { cat: "housing", labelAr: "فائدة القرض السكني", labelEn: "Housing Loan Interest", settler: 0, citizen: 5 },
    { cat: "tax", labelAr: "ضريبة الشركات %", labelEn: "Corporate Tax %", settler: 6, citizen: 18.5 },
    { cat: "transport", labelAr: "حصة ميزانية النقل", labelEn: "Transport Budget Share", settler: 25, citizen: 2 },
  ],

  shockingComparisons: [
    { ar: "59 بؤرة في 2024 = أكثر من 27 سنة كاملة (1996-2023)", en: "59 outposts in 2024 = more than 27 full years (1996-2023)" },
    { ar: "24 ألف دونم في 2024 = نصف كل ما صودر منذ أوسلو", en: "24K dunams in 2024 = half of all seized since Oslo" },
    { ar: "200+ قرار دولي عبر 58 عامًا: نسبة التنفيذ 0%", en: "200+ resolutions over 58 years: 0% implemented" },
    { ar: "كل $1 إسرائيلي على الاستيطان = $8 خسائر فلسطينية", en: "Every $1 Israeli on settlements = $8 Palestinian losses" },
    { ar: "2% من السكان يحصلون على 25% من ميزانية النقل", en: "2% of population gets 25% of transport budget" },
    { ar: "المستوطن يحصل على 2.65 ضعف المواطن الإسرائيلي العادي", en: "A settler gets 2.65x what a regular Israeli citizen gets" },
  ],
};

// ===== TRANSLATIONS =====
const T = {
  ar: {
    dashboard: "اللوحة الرئيسية",
    toc: "الفهرس",
    visuals: "الرسوم",
    glossary: "المصطلحات",
    methodology: "المنهجية",
    search: "البحث",
    executiveSummary: "الملخص التنفيذي",
    keyIndicators: "المؤشرات الرئيسية",
    timeline: "الخط الزمني",
    chapters: "فصول الدراسة",
    topVisuals: "أبرز الرسوم البيانية",
    shockingFacts: "حقائق صادمة",
    settlersGrowth: "نمو المستوطنين (1967-2025)",
    spendingBreakdown: "توزيع الإنفاق التراكمي",
    violenceSurge: "تصاعد العنف الاستيطاني",
    checkpointsEvol: "تطور عدد الحواجز",
    annualSpending: "الإنفاق السنوي (مليون $)",
    source: "المصدر",
    readMore: "اقرأ المزيد",
    viewAll: "عرض الكل",
    summaryText: "أكبر توثيق كمّي شامل للمشروع الاستيطاني الإسرائيلي عبر 58 عامًا، يغطي الأبعاد التاريخية والاقتصادية والقانونية والإنسانية. من صفر مستوطن عام 1967 إلى أكثر من 750 ألف اليوم.",
    lang: "EN",
    langFull: "English",
    phase: "المرحلة",
    growth: "النمو",
    billion: "مليار",
    million: "مليون",
    year: "سنة",
    spendingVsLoss: "الإنفاق مقابل الخسائر",
    declared: "المُعلن",
    hidden: "المخفي",
    total: "الإجمالي",
    aboutStudy: "حول الدراسة",
    aboutTabs: {
      what: "ما هي الدراسة؟",
      studied: "ماذا درست؟",
      expanded: "فيمَ توسّعت؟",
      achieved: "ماذا أنجزت؟",
      methodology: "المنهجية",
    },
    aboutContent: {
      what: {
        title: "58 عاماً من الاستيطان: التوثيق الكمّي الشامل (1967–2025)",
        body: "دراسة تحليلية كمّية شاملة تُوثّق المشروع الاستيطاني الإسرائيلي في الضفة الغربية والقدس الشرقية على مدى 58 عاماً. تعتمد منهجية التوثيق بالأرقام والبيانات القابلة للتحقق، مستندةً إلى أكثر من 13 مصدراً دولياً وإسرائيلياً وفلسطينياً: مؤسسات الأمم المتحدة (OCHA، UNCTAD، UNRWA)، البنك الدولي، منظمات حقوقية إسرائيلية (B'Tselem، Peace Now، ICAHD)، مراكز أبحاث فلسطينية (ARIJ، PCBS، BADIL)، تقارير الكونغرس الأمريكي (CRS)، ووزارة المالية الإسرائيلية. كل رقم في الدراسة قابل للتحقق من مصدره الأصلي.",
      },
      studied: {
        title: "أربعة أبواب رئيسية وملاحق تفصيلية",
        items: [
          { icon: "📜", label: "التأسيس والإطار", text: "رصد التطور التاريخي عبر 7 مراحل — من التأسيس (1967) إلى التسارع بعد 7 أكتوبر 2023، والإطار القانوني: 200+ قرار دولي و3 أحكام من محكمة العدل الدولية بنسبة تنفيذ صفر." },
          { icon: "💰", label: "الاقتصاد الاستيطاني", text: "الإنفاق الإسرائيلي (48.5–71.6 مليار $) والقطاعات الاستيطانية والدعم الأمريكي (140.6 مليار $)، مقابل الخسائر الفلسطينية: مصادرة الأراضي، تدمير 800,000+ شجرة زيتون، هدم 59,000+ مبنى، والخسائر الاقتصادية الشاملة." },
          { icon: "🏗️", label: "البنية التحتية للسيطرة", text: "849 حاجزاً، جدار فصل 712 كم، طرق التفافية، قواعد عسكرية، نظام تصاريح، عنف استيطاني، اعتقالات، وتهجير قسري لأكثر من 500,000 فلسطيني." },
          { icon: "📊", label: "التحليل والنتائج", text: "6 مقارنات صادمة تكشف اللامساواة الممنهجة، تحليل منحنى التسارع، وإثبات استمرارية السياسة عبر جميع الحكومات من كل الأطياف السياسية." },
        ],
      },
      expanded: {
        title: "مجالات لم تُغطَّ سابقاً بهذا العمق",
        items: [
          { icon: "⏳", value: "8.1 مليار ساعة", text: "حساب الأعمار البشرية الضائعة على الحواجز: تعادل 13,200 حياة كاملة بتكلفة 39.2 مليار $ — حساب غير مسبوق." },
          { icon: "📈", value: "357–450 مليار $", text: "التقدير الإجمالي الشامل للخسائر الفلسطينية — ضعف تقديرات المنظمات الدولية، بإضافة بنود لم تُحسب سابقاً: بروتوكول باريس، الأراضي كأصول، المنازل المهدومة." },
          { icon: "🔬", value: "Fungibility", text: "تحليل الدعم الأمريكي بنظرية قابلية الأموال للاستبدال المعتمدة في أدبيات البنك الدولي، مع أدلة تجريبية من خصومات ضمانات القروض (1.085 مليار $)." },
          { icon: "🔴", value: "10x المعدل", text: "توثيق التصعيد بعد 7 أكتوبر: 24,258 دونم صودرت (2024)، 59 بؤرة جديدة، +52% إنفاق في ربع واحد، +32% حواجز." },
        ],
      },
      achieved: {
        title: "الخلاصات المركزية",
        equation: "كل $1 أنفقته إسرائيل = $8 خسائر فلسطينية",
        equationSub: "40–60 مليار $ إنفاق ← 300–400 مليار $ خسائر",
        conclusions: [
          "الاستيطان سياسة ممنهجة وليس ممارسات عشوائية",
          "سياسة دولة فوق حزبية — ثابتة عبر جميع الحكومات",
          "التصعيد المستمر عبر الزمن وليس الثبات أو التراجع",
          "نسبة 1:8 تكشف نظام نهب وإفقار مبرمج",
          "200+ قرار دولي بدون أي تطبيق أو مساءلة",
          "أثر تراكمي متعدد الأجيال لا يمكن تعويضه",
        ],
        finalMessage: "مشروع اقتصادي-سياسي ممنهج لتصفية إمكانية قيام دولة فلسطينية",
      },
      methodology: {
        title: "معايير صارمة للموثوقية",
        items: [
          { icon: "📋", label: "تصنيف ثلاثي", text: "كل رقم مصنّف: موثّق (من مصادر أولية) / محسوب (من أرقام موثقة) / تقديري (للفترات التاريخية)." },
          { icon: "🔍", label: "تحقق متقاطع", text: "التحقق من مصدرين مستقلين على الأقل حيثما أمكن، مع معايير واضحة للقبول والرفض." },
          { icon: "📉", label: "تقديرات محافظة", text: "اعتماد الحد الأدنى المعقول لتعزيز المصداقية، مع هوامش خطأ معلنة (±5% إلى ±40%)." },
          { icon: "🔓", label: "شفافية كاملة", text: "جميع المنهجيات والافتراضات موثقة وقابلة للتحقق والمراجعة من أي باحث مستقل." },
        ],
      },
    },
  },
  en: {
    dashboard: "Main Dashboard",
    toc: "Contents",
    visuals: "Visuals",
    glossary: "Glossary",
    methodology: "Methodology",
    search: "Search",
    executiveSummary: "Executive Summary",
    keyIndicators: "Key Indicators",
    timeline: "Timeline",
    chapters: "Study Chapters",
    topVisuals: "Key Visualizations",
    shockingFacts: "Shocking Facts",
    settlersGrowth: "Settler Growth (1967-2025)",
    spendingBreakdown: "Cumulative Spending Breakdown",
    violenceSurge: "Settler Violence Surge",
    checkpointsEvol: "Checkpoint Evolution",
    annualSpending: "Annual Spending ($M)",
    source: "Source",
    readMore: "Read more",
    viewAll: "View all",
    summaryText: "The most comprehensive quantitative documentation of the Israeli settlement enterprise across 58 years, covering historical, economic, legal, and humanitarian dimensions. From zero settlers in 1967 to over 750,000 today.",
    lang: "ع",
    langFull: "عربي",
    phase: "Phase",
    growth: "Growth",
    billion: "billion",
    million: "million",
    year: "year",
    spendingVsLoss: "Spending vs Losses",
    declared: "Declared",
    hidden: "Hidden",
    total: "Total",
    aboutStudy: "About the Study",
    aboutTabs: {
      what: "What is this?",
      studied: "What it covers",
      expanded: "New contributions",
      achieved: "Key findings",
      methodology: "Methodology",
    },
    aboutContent: {
      what: {
        title: "58 Years of Settlement: Comprehensive Quantitative Documentation (1967–2025)",
        body: "A comprehensive quantitative analytical study documenting the Israeli settlement enterprise in the West Bank and East Jerusalem over 58 years. It relies on verifiable data from 13+ international, Israeli, and Palestinian sources: UN agencies (OCHA, UNCTAD, UNRWA), the World Bank, Israeli human rights organizations (B'Tselem, Peace Now, ICAHD), Palestinian research centers (ARIJ, PCBS, BADIL), US Congressional Research Service (CRS), and the Israeli Ministry of Finance. Every figure is traceable to its original source.",
      },
      studied: {
        title: "Four main parts with detailed appendices",
        items: [
          { icon: "📜", label: "Foundation & Framework", text: "Historical evolution through 7 phases — from establishment (1967) to post-October 7 escalation, plus legal framework: 200+ international resolutions and 3 ICJ rulings with zero implementation." },
          { icon: "💰", label: "Settlement Economics", text: "Israeli spending ($48.5–71.6B), settlement economic sectors, US support ($140.6B), vs Palestinian losses: land confiscation, 800,000+ olive trees destroyed, 59,000+ structures demolished." },
          { icon: "🏗️", label: "Control Infrastructure", text: "849 checkpoints, 712 km separation wall, bypass roads, military bases, permit system, settler violence, arrests, and forced displacement of 500,000+ Palestinians." },
          { icon: "📊", label: "Analysis & Findings", text: "6 shocking comparisons revealing systemic inequality, acceleration curve analysis, and proof of policy continuity across all governments regardless of political affiliation." },
        ],
      },
      expanded: {
        title: "Areas not previously covered at this depth",
        items: [
          { icon: "⏳", value: "8.1B hours", text: "Human lifetimes lost at checkpoints: equivalent to 13,200 complete lives at $39.2B cost — an unprecedented calculation." },
          { icon: "📈", value: "$357–450B", text: "Comprehensive Palestinian losses estimate — double international estimates, adding previously uncounted items: Paris Protocol, land as assets, demolished homes." },
          { icon: "🔬", value: "Fungibility", text: "US support analyzed via World Bank-endorsed aid fungibility theory, with empirical evidence from loan guarantee deductions ($1.085B)." },
          { icon: "🔴", value: "10x the rate", text: "Post-Oct 7 escalation: 24,258 dunams seized (2024), 59 new outposts, +52% spending in one quarter, +32% checkpoints." },
        ],
      },
      achieved: {
        title: "Central conclusions",
        equation: "Every $1 Israel spent = $8 Palestinian losses",
        equationSub: "$40–60B spending → $300–400B losses",
        conclusions: [
          "Settlement is a systematic policy, not random practices",
          "A state policy above party lines — consistent across all governments",
          "Continuous escalation over time, not stagnation or retreat",
          "The 1:8 ratio reveals a programmed system of extraction",
          "200+ international resolutions with zero enforcement",
          "Multi-generational cumulative impact beyond compensation",
        ],
        finalMessage: "A systematic economic-political project to eliminate the possibility of a Palestinian state",
      },
      methodology: {
        title: "Rigorous reliability standards",
        items: [
          { icon: "📋", label: "Triple classification", text: "Every figure classified: Documented (primary sources) / Calculated (from documented data) / Estimated (historical periods)." },
          { icon: "🔍", label: "Cross-verification", text: "Verified from at least two independent sources where possible, with clear acceptance and rejection criteria." },
          { icon: "📉", label: "Conservative estimates", text: "Using minimum reasonable bounds for credibility, with declared error margins (±5% to ±40%)." },
          { icon: "🔓", label: "Full transparency", text: "All methodologies and assumptions documented and verifiable by any independent researcher." },
        ],
      },
    },
  },
};

// ===== UTILITY COMPONENTS =====

function AnimatedCounter({ value, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const numVal = parseInt(String(value).replace(/[^0-9]/g, "")) || 0;
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = numVal / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= numVal) { setCount(numVal); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [visible, numVal, duration]);

  const formatted = String(value).includes("$") ? `$${count.toLocaleString()}` :
    String(value).includes("km") ? `${count.toLocaleString()} km` :
    String(value).includes(":") ? value :
    String(value).includes("B") ? value :
    count.toLocaleString();

  return <span ref={ref}>{visible ? formatted : "0"}</span>;
}

// ===== MAIN APP =====
export default function SettlementDashboard() {
  return <ErrorBoundary><SettlementDashboardInner /></ErrorBoundary>;
}

function SettlementDashboardInner() {
  const [lang, setLang] = useState("ar");
  const [activePage, setActivePage] = useState("dashboard");
  const [activePhase, setActivePhase] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [tocExpanded, setTocExpanded] = useState({});
  const [aboutTab, setAboutTab] = useState("what");
  const t = T[lang];
  const isRTL = lang === "ar";

  useEffect(() => {
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const spendingPieData = STUDY_DATA.spending.map((s, i) => ({
    name: s.category[lang],
    value: (s.min + s.max) / 2,
    color: CHART_COLORS[i],
    pct: s.pct,
  }));

  const toggleToc = (id) => setTocExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  // ===== RENDER =====
  return (
    <div dir={isRTL ? "rtl" : "ltr"} style={{ fontFamily: "'Tajawal', 'Segoe UI', sans-serif", background: COLORS.cream, minHeight: "100vh", color: COLORS.gray[900] }}>
      {/* Google Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: ${COLORS.red}40; border-radius: 3px; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(${isRTL ? '30px' : '-30px'}); } to { opacity: 1; transform: translateX(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        @keyframes gradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .fade-in { animation: fadeInUp 0.6s ease-out forwards; }
        .slide-in { animation: slideIn 0.5s ease-out forwards; }
        .hover-lift { transition: all 0.3s ease; }
        .hover-lift:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.12); }
        .glass { background: rgba(255,255,255,0.85); backdrop-filter: blur(12px); }
        .nav-item { padding: 10px 18px; border-radius: 10px; cursor: pointer; transition: all 0.2s; font-weight: 500; font-size: 14px; }
        .nav-item:hover { background: ${COLORS.red}15; }
        .nav-item.active { background: ${COLORS.red}; color: white; }
        .section-title { font-size: 22px; font-weight: 800; margin-bottom: 20px; position: relative; padding-bottom: 12px; }
        .section-title::after { content: ''; position: absolute; bottom: 0; ${isRTL ? 'right' : 'left'}: 0; width: 60px; height: 4px; background: linear-gradient(90deg, ${COLORS.red}, ${COLORS.green}); border-radius: 2px; }
        .card { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 2px 20px rgba(0,0,0,0.06); border: 1px solid ${COLORS.gray[200]}; }
        .kpi-card { background: white; border-radius: 16px; padding: 20px; box-shadow: 0 2px 16px rgba(0,0,0,0.05); border: 1px solid ${COLORS.gray[200]}; position: relative; overflow: hidden; cursor: pointer; }
        .kpi-card::before { content: ''; position: absolute; top: 0; ${isRTL ? 'right' : 'left'}: 0; width: 4px; height: 100%; border-radius: 0 2px 2px 0; }
        .fact-card { background: linear-gradient(135deg, ${COLORS.black} 0%, ${COLORS.redDark} 100%); color: white; border-radius: 16px; padding: 24px; }
        .timeline-dot { width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.2); cursor: pointer; transition: all 0.3s; position: relative; z-index: 2; }
        .timeline-dot:hover { transform: scale(1.4); }
        .chapter-card { background: white; border-radius: 16px; padding: 24px; cursor: pointer; border: 1px solid ${COLORS.gray[200]}; transition: all 0.3s; }
        .chapter-card:hover { border-color: ${COLORS.red}; box-shadow: 0 8px 32px rgba(192,57,43,0.1); transform: translateY(-2px); }
        .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
      `}</style>

      {/* ===== HEADER ===== */}
      <header className="glass" style={{
        position: "sticky", top: 0, zIndex: 100,
        borderBottom: `1px solid ${COLORS.gray[200]}`,
        transition: "all 0.3s",
        boxShadow: scrollY > 50 ? "0 4px 30px rgba(0,0,0,0.08)" : "none",
      }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: `linear-gradient(135deg, ${COLORS.red}, ${COLORS.black})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontWeight: 900, fontSize: 18,
            }}>58</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, lineHeight: 1.2 }}>{STUDY_DATA.title[lang]}</div>
              <div style={{ fontSize: 11, color: COLORS.gray[500] }}>{STUDY_DATA.subtitle[lang]}</div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {[
              ["dashboard", t.dashboard], ["toc", t.toc], ["visuals", t.visuals],
            ].map(([page, label]) => (
              <div key={page}
                className={`nav-item ${activePage === page ? "active" : ""}`}
                onClick={() => setActivePage(page)}
              >{label}</div>
            ))}
            <div style={{ width: 1, height: 24, background: COLORS.gray[300], margin: "0 8px" }} />
            <div className="nav-item" onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              style={{ fontWeight: 700, fontSize: 13 }}>
              {t.lang}
            </div>
          </nav>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 24px" }}>

        {/* === DASHBOARD PAGE === */}
        {activePage === "dashboard" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

            {/* Hero / Executive Summary */}
            <div className="fade-in" style={{
              background: `linear-gradient(135deg, ${COLORS.black} 0%, ${COLORS.redDark} 50%, ${COLORS.greenDark} 100%)`,
              borderRadius: 24, padding: "48px 40px", color: "white", position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0.05, backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px)" }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div className="badge" style={{ background: COLORS.red, color: "white", marginBottom: 16, fontSize: 12 }}>
                  {t.executiveSummary}
                </div>
                <h1 style={{ fontSize: 36, fontWeight: 900, lineHeight: 1.3, marginBottom: 16, maxWidth: 700 }}>
                  {STUDY_DATA.title[lang]}
                </h1>
                <p style={{ fontSize: 18, opacity: 0.9, lineHeight: 1.8, maxWidth: 700 }}>
                  {t.summaryText}
                </p>
                <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
                  <div onClick={() => setActivePage("toc")} style={{ padding: "10px 24px", background: COLORS.red, borderRadius: 12, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
                    📑 {t.toc} →
                  </div>
                </div>
              </div>
            </div>

            {/* About Study Section with Tabs */}
            <div className="fade-in" style={{
              background: "white", borderRadius: 20, overflow: "hidden",
              border: `1px solid ${COLORS.gray[200]}`,
              boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            }}>
              {/* Section Header */}
              <div style={{
                padding: "24px 32px 0",
                borderBottom: `1px solid ${COLORS.gray[100]}`,
              }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.black, marginBottom: 16 }}>
                  📖 {t.aboutStudy}
                </h2>
                {/* Tabs */}
                <div style={{
                  display: "flex", gap: 0, overflowX: "auto",
                  WebkitOverflowScrolling: "touch",
                  scrollbarWidth: "none",
                }}>
                  {["what", "studied", "expanded", "achieved", "methodology"].map((tab) => (
                    <button key={tab} onClick={() => setAboutTab(tab)} style={{
                      padding: "10px 18px", border: "none", cursor: "pointer",
                      background: aboutTab === tab ? "transparent" : "transparent",
                      color: aboutTab === tab ? COLORS.red : COLORS.gray[500],
                      fontWeight: aboutTab === tab ? 800 : 500,
                      fontSize: 13, whiteSpace: "nowrap",
                      borderBottom: aboutTab === tab ? `3px solid ${COLORS.red}` : "3px solid transparent",
                      transition: "all 0.2s ease",
                      fontFamily: "inherit",
                    }}>
                      {t.aboutTabs[tab]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div style={{ padding: "28px 32px 32px", minHeight: 200 }}>

                {/* TAB: What */}
                {aboutTab === "what" && (
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: COLORS.black, marginBottom: 16, lineHeight: 1.5 }}>
                      {t.aboutContent.what.title}
                    </h3>
                    <p style={{ fontSize: 15, lineHeight: 2, color: COLORS.gray[700] }}>
                      {t.aboutContent.what.body}
                    </p>
                    <div style={{
                      marginTop: 20, display: "flex", flexWrap: "wrap", gap: 8,
                    }}>
                      {["OCHA", "UNCTAD", "World Bank", "B'Tselem", "Peace Now", "ICAHD", "ARIJ", "PCBS", "CRS", "UNRWA", "BADIL", "Kerem Navot", "Adva Center"].map(s => (
                        <span key={s} style={{
                          padding: "4px 12px", borderRadius: 20,
                          background: COLORS.gray[100], color: COLORS.gray[600],
                          fontSize: 11, fontWeight: 600,
                        }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB: Studied */}
                {aboutTab === "studied" && (
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.gray[500], marginBottom: 20 }}>
                      {t.aboutContent.studied.title}
                    </h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                      {t.aboutContent.studied.items.map((item, i) => (
                        <div key={i} style={{
                          padding: 20, borderRadius: 16,
                          background: COLORS.gray[50],
                          border: `1px solid ${COLORS.gray[100]}`,
                        }}>
                          <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.black, marginBottom: 8 }}>
                            {item.label}
                          </div>
                          <div style={{ fontSize: 13, lineHeight: 1.8, color: COLORS.gray[600] }}>
                            {item.text}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB: Expanded */}
                {aboutTab === "expanded" && (
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.gray[500], marginBottom: 20 }}>
                      {t.aboutContent.expanded.title}
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {t.aboutContent.expanded.items.map((item, i) => (
                        <div key={i} style={{
                          display: "flex", gap: 16, alignItems: "flex-start",
                          padding: 20, borderRadius: 16,
                          background: `linear-gradient(135deg, ${COLORS.gray[50]} 0%, white 100%)`,
                          border: `1px solid ${COLORS.gray[100]}`,
                        }}>
                          <div style={{
                            minWidth: 56, height: 56, borderRadius: 16,
                            background: COLORS.red + "10",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 24,
                          }}>{item.icon}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{
                              fontSize: 18, fontWeight: 900, color: COLORS.red,
                              marginBottom: 6, fontFamily: "monospace",
                            }}>{item.value}</div>
                            <div style={{ fontSize: 13, lineHeight: 1.8, color: COLORS.gray[600] }}>
                              {item.text}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB: Achieved */}
                {aboutTab === "achieved" && (
                  <div>
                    {/* 1:8 Equation Hero */}
                    <div style={{
                      background: `linear-gradient(135deg, ${COLORS.black} 0%, ${COLORS.redDark} 100%)`,
                      borderRadius: 20, padding: "32px 28px", color: "white",
                      textAlign: "center", marginBottom: 24,
                    }}>
                      <div style={{ fontSize: 14, opacity: 0.7, marginBottom: 8 }}>
                        ⚖️ {t.aboutContent.achieved.title}
                      </div>
                      <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
                        {t.aboutContent.achieved.equation}
                      </div>
                      <div style={{ fontSize: 14, opacity: 0.6 }}>
                        {t.aboutContent.achieved.equationSub}
                      </div>
                    </div>
                    {/* 6 Conclusions */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
                      {t.aboutContent.achieved.conclusions.map((c, i) => (
                        <div key={i} style={{
                          display: "flex", gap: 12, alignItems: "flex-start",
                          padding: "14px 16px", borderRadius: 12,
                          background: COLORS.gray[50],
                          border: `1px solid ${COLORS.gray[100]}`,
                        }}>
                          <div style={{
                            minWidth: 28, height: 28, borderRadius: 8,
                            background: COLORS.red, color: "white",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 13, fontWeight: 900,
                          }}>{i + 1}</div>
                          <div style={{ fontSize: 13, lineHeight: 1.7, color: COLORS.gray[700], fontWeight: 500 }}>
                            {c}
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Final Message */}
                    <div style={{
                      marginTop: 20, padding: "16px 24px", borderRadius: 12,
                      background: COLORS.red + "08",
                      border: `1px solid ${COLORS.red}22`,
                      textAlign: "center",
                    }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.red }}>
                        💎 {t.aboutContent.achieved.finalMessage}
                      </span>
                    </div>
                  </div>
                )}

                {/* TAB: Methodology */}
                {aboutTab === "methodology" && (
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.gray[500], marginBottom: 20 }}>
                      {t.aboutContent.methodology.title}
                    </h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
                      {t.aboutContent.methodology.items.map((item, i) => (
                        <div key={i} style={{
                          padding: 20, borderRadius: 16,
                          background: COLORS.gray[50],
                          border: `1px solid ${COLORS.gray[100]}`,
                          position: "relative",
                          overflow: "hidden",
                        }}>
                          <div style={{
                            position: "absolute", top: 0, [isRTL ? "right" : "left"]: 0,
                            width: 4, height: "100%",
                            background: [COLORS.green, COLORS.accent.sky, COLORS.gold, COLORS.greenDark][i],
                          }} />
                          <div style={{ fontSize: 24, marginBottom: 10 }}>{item.icon}</div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.black, marginBottom: 8 }}>
                            {item.label}
                          </div>
                          <div style={{ fontSize: 13, lineHeight: 1.8, color: COLORS.gray[600] }}>
                            {item.text}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* KPI Grid */}
            <div>
              <h2 className="section-title">{t.keyIndicators}</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                {STUDY_DATA.kpis.map((kpi, i) => (
                  <div key={kpi.id} className="kpi-card hover-lift fade-in"
                    style={{ animationDelay: `${i * 0.08}s`, animationFillMode: "both" }}>
                    <div style={{ position: "absolute", top: 0, [isRTL ? "right" : "left"]: 0, width: 4, height: "100%", background: kpi.color, borderRadius: isRTL ? "0 2px 2px 0" : "2px 0 0 2px" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontSize: 13, color: COLORS.gray[500], marginBottom: 4, fontWeight: 500 }}>
                          {kpi.icon} {kpi.label[lang]}
                        </div>
                        <div style={{ fontSize: 32, fontWeight: 900, color: kpi.color, lineHeight: 1.1 }}>
                          <AnimatedCounter value={kpi.value} />
                        </div>
                      </div>
                      <div style={{
                        padding: "4px 10px", borderRadius: 8,
                        background: kpi.color + "12", color: kpi.color,
                        fontSize: 12, fontWeight: 700, textAlign: "center",
                      }}>
                        <div>{kpi.change}</div>
                        <div style={{ fontSize: 10, opacity: 0.7 }}>{kpi.changeLabel[lang]}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 10, color: COLORS.gray[400], marginTop: 8 }}>
                      {t.source}: {kpi.source}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Charts Row 1: Settlers Growth + Spending */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              {/* Settlers Growth Chart */}
              <div className="card fade-in">
                <h3 className="section-title" style={{ fontSize: 18 }}>{t.settlersGrowth}</h3>
                <div style={{ width: "100%", height: 360 }}>
                  <ResponsiveContainer>
                    <AreaChart data={STUDY_DATA.settlersGrowth}>
                      <defs>
                        <linearGradient id="settlerGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={COLORS.red} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={COLORS.red} stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gray[200]} />
                      <XAxis dataKey="year" tick={{ fontSize: 11, fill: COLORS.gray[600] }} reversed={isRTL} />
                      <YAxis tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} tick={{ fontSize: 11, fill: COLORS.gray[600] }} orientation={isRTL ? "right" : "left"} />
                      <Tooltip
                        contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", direction: isRTL ? "rtl" : "ltr" }}
                        formatter={(v) => [v.toLocaleString(), lang === "ar" ? "مستوطن" : "Settlers"]}
                      />
                      <Area type="monotone" dataKey="settlers" stroke={COLORS.red} strokeWidth={3} fill="url(#settlerGrad)" dot={{ r: 3, fill: COLORS.red, strokeWidth: 0 }} activeDot={{ r: 6, stroke: COLORS.red, strokeWidth: 2, fill: "white" }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Spending Pie */}
              <div className="card fade-in">
                <h3 className="section-title" style={{ fontSize: 18 }}>{t.spendingBreakdown}</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: "50%", height: 320 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie data={spendingPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={120} dataKey="value" paddingAngle={2}>
                          {spendingPieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 12, border: "none", direction: isRTL ? "rtl" : "ltr" }}
                          formatter={(v) => [`$${v.toFixed(1)}B`, ""]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ flex: 1 }}>
                    {spendingPieData.map((s, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, fontSize: 12 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 3, background: s.color, flexShrink: 0 }} />
                        <span style={{ flex: 1, color: COLORS.gray[700] }}>{s.name}</span>
                        <span style={{ fontWeight: 700, color: COLORS.gray[800] }}>{s.pct}</span>
                      </div>
                    ))}
                    <div style={{ marginTop: 16, padding: "12px 16px", background: COLORS.red + "08", borderRadius: 10, border: `1px solid ${COLORS.red}20` }}>
                      <div style={{ fontSize: 11, color: COLORS.gray[500] }}>{t.total}</div>
                      <div style={{ fontSize: 24, fontWeight: 900, color: COLORS.red }}>$48.5-71.6B</div>
                      <div style={{ fontSize: 11, color: COLORS.gray[500] }}>1967-2025</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row 2: Violence + Annual Spending */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              {/* Violence Surge */}
              <div className="card fade-in">
                <h3 className="section-title" style={{ fontSize: 18 }}>{t.violenceSurge}</h3>
                <div style={{ width: "100%", height: 320 }}>
                  <ResponsiveContainer>
                    <BarChart data={STUDY_DATA.violenceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gray[200]} />
                      <XAxis dataKey="year" tick={{ fontSize: 11, fill: COLORS.gray[600] }} reversed={isRTL} />
                      <YAxis tick={{ fontSize: 11, fill: COLORS.gray[600] }} orientation={isRTL ? "right" : "left"} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: "none", direction: isRTL ? "rtl" : "ltr" }}
                        formatter={(v) => [v.toLocaleString(), lang === "ar" ? "حادثة" : "Incidents"]} />
                      <Bar dataKey="incidents" radius={[6, 6, 0, 0]}>
                        {STUDY_DATA.violenceData.map((e, i) => (
                          <Cell key={i} fill={e.year >= 2023 ? COLORS.red : e.year >= 2021 ? COLORS.redLight : COLORS.gray[400]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ textAlign: "center", fontSize: 12, color: COLORS.gray[500], marginTop: 8 }}>
                  {lang === "ar" ? "* 2024: النصف الأول فقط (يناير-يوليو)" : "* 2024: First half only (Jan-Jul)"}
                </div>
              </div>

              {/* Annual Spending */}
              <div className="card fade-in">
                <h3 className="section-title" style={{ fontSize: 18 }}>{t.annualSpending}</h3>
                <div style={{ width: "100%", height: 320 }}>
                  <ResponsiveContainer>
                    <ComposedChart data={STUDY_DATA.spendingTimeline}>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gray[200]} />
                      <XAxis dataKey="period" tick={{ fontSize: 10, fill: COLORS.gray[600] }} reversed={isRTL} />
                      <YAxis tick={{ fontSize: 11, fill: COLORS.gray[600] }} orientation={isRTL ? "right" : "left"} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: "none", direction: isRTL ? "rtl" : "ltr" }}
                        formatter={(v, name) => [`$${v}M`, name === "annual" ? (lang === "ar" ? "المعدل السنوي" : "Annual Avg") : ""]} />
                      <Bar dataKey="annual" radius={[6, 6, 0, 0]}>
                        {STUDY_DATA.spendingTimeline.map((e, i) => (
                          <Cell key={i} fill={i >= 5 ? COLORS.red : i >= 3 ? COLORS.gold : COLORS.greenDark} />
                        ))}
                      </Bar>
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="card fade-in">
              <h2 className="section-title">{t.timeline}: {lang === "ar" ? "المراحل السبع" : "Seven Phases"}</h2>
              <div style={{ position: "relative", padding: "24px 0" }}>
                {/* Timeline Line */}
                <div style={{ position: "absolute", top: 32, left: 0, right: 0, height: 3, background: `linear-gradient(${isRTL ? "270deg" : "90deg"}, ${COLORS.gray[300]}, ${COLORS.red}, ${COLORS.greenDark})`, borderRadius: 2 }} />
                {/* Phase dots and labels */}
                <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
                  {STUDY_DATA.phases.map((phase, i) => (
                    <div key={phase.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, cursor: "pointer" }}
                      onClick={() => setActivePhase(activePhase === i ? null : i)}>
                      <div className="timeline-dot" style={{ background: phase.color, marginBottom: 12 }} />
                      <div style={{ textAlign: "center", maxWidth: 130 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: phase.color }}>{phase.period}</div>
                        <div style={{ fontSize: 11, fontWeight: 600, marginTop: 2, lineHeight: 1.3 }}>{phase.name[lang]}</div>
                        <div style={{ fontSize: 10, color: COLORS.gray[500], marginTop: 2 }}>{phase.start.toLocaleString()} → {phase.end.toLocaleString()}</div>
                        {phase.growth !== "∞" && phase.growth !== "قياسي" && (
                          <div className="badge" style={{ background: COLORS.red + "15", color: COLORS.red, marginTop: 4 }}>+{phase.growth}</div>
                        )}
                      </div>
                      {activePhase === i && (
                        <div className="slide-in" style={{
                          marginTop: 12, padding: 16, background: "white", borderRadius: 12,
                          boxShadow: "0 8px 32px rgba(0,0,0,0.12)", border: `2px solid ${phase.color}`,
                          maxWidth: 200, fontSize: 12, lineHeight: 1.6, textAlign: isRTL ? "right" : "left",
                        }}>
                          {phase.event[lang]}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Shocking Facts */}
            <div>
              <h2 className="section-title">{t.shockingFacts}</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
                {STUDY_DATA.shockingComparisons.map((fact, i) => (
                  <div key={i} className="fact-card hover-lift fade-in" style={{ animationDelay: `${i * 0.1}s`, animationFillMode: "both" }}>
                    <div style={{ fontSize: 28, marginBottom: 12 }}>💎</div>
                    <div style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.8, opacity: 0.95 }}>
                      {fact[lang]}
                    </div>
                  </div>
                ))}
              </div>
            </div>



          </div>
        )}

        {/* === TOC PAGE === */}
        {activePage === "toc" && (
          <div className="fade-in">
            <h2 className="section-title" style={{ fontSize: 28 }}>{lang === "ar" ? "الفهرس التفاعلي" : "Interactive Table of Contents"}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {STUDY_DATA.chapters.map((ch, ci) => (
                <div key={ch.id} className="card" style={{ borderInlineStart: `4px solid ${CHART_COLORS[ci]}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: 14,
                      background: `linear-gradient(135deg, ${CHART_COLORS[ci]}, ${CHART_COLORS[ci]}88)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "white", fontWeight: 900, fontSize: 24,
                    }}>{ch.bab}</div>
                    <div>
                      <div style={{ fontSize: 12, color: COLORS.gray[500] }}>{lang === "ar" ? `الباب ${ch.bab}` : `Part ${ch.bab}`}</div>
                      <div style={{ fontSize: 22, fontWeight: 800 }}>{ch.title[lang]}</div>
                    </div>
                  </div>
                  {ch.sections.map(sec => (
                    <div key={sec.id} style={{ marginBottom: 16 }}>
                      <div onClick={() => toggleToc(sec.id + "-toc")} style={{
                        display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
                        padding: "12px 16px", borderRadius: 12, background: COLORS.gray[50],
                        fontWeight: 700, fontSize: 15, color: COLORS.gray[800],
                        transition: "background 0.2s",
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = COLORS.gray[100]}
                        onMouseLeave={e => e.currentTarget.style.background = COLORS.gray[50]}>
                        <span style={{ transform: tocExpanded[sec.id + "-toc"] ? "rotate(90deg)" : "rotate(0)", transition: "0.2s", display: "inline-block", color: CHART_COLORS[ci] }}>▶</span>
                        {sec.title[lang]}
                        <span className="badge" style={{ marginInlineStart: "auto", background: CHART_COLORS[ci] + "15", color: CHART_COLORS[ci] }}>
                          {sec.items.length} {lang === "ar" ? "فصل" : "sections"}
                        </span>
                      </div>
                      {tocExpanded[sec.id + "-toc"] && (
                        <div style={{ padding: "12px 32px", display: "flex", flexDirection: "column", gap: 8 }}>
                          {sec.items.map(item => (
                            <div key={item.id}>
                              <div onClick={() => toggleToc(item.id + "-sum")} className="hover-lift" style={{
                                fontSize: 14, color: COLORS.gray[700], cursor: "pointer",
                                padding: "10px 16px", borderRadius: tocExpanded[item.id + "-sum"] ? "10px 10px 0 0" : 10, background: tocExpanded[item.id + "-sum"] ? CHART_COLORS[ci] + "08" : "white",
                                border: `1px solid ${tocExpanded[item.id + "-sum"] ? CHART_COLORS[ci] + "30" : COLORS.gray[200]}`,
                                display: "flex", alignItems: "center", gap: 8,
                                transition: "all 0.2s",
                              }}>
                                <span style={{ color: CHART_COLORS[ci], fontWeight: 700, fontSize: 13, minWidth: 30 }}>{item.id}</span>
                                {item.title[lang]}
                                <span style={{ marginInlineStart: "auto", fontSize: 11, color: tocExpanded[item.id + "-sum"] ? CHART_COLORS[ci] : COLORS.gray[400], transition: "0.2s", transform: tocExpanded[item.id + "-sum"] ? "rotate(90deg)" : "rotate(0)", display: "inline-block" }}>
                                  {item.summary ? "▶" : "→"}
                                </span>
                              </div>
                              {tocExpanded[item.id + "-sum"] && item.summary && (
                                <div style={{
                                  padding: "14px 18px", fontSize: 13, lineHeight: 1.8,
                                  color: COLORS.gray[600], background: CHART_COLORS[ci] + "05",
                                  borderRadius: "0 0 10px 10px",
                                  border: `1px solid ${CHART_COLORS[ci]}20`, borderTop: "none",
                                  direction: lang === "ar" ? "rtl" : "ltr",
                                  textAlign: lang === "ar" ? "right" : "left",
                                }}>
                                  {item.summary[lang]}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === VISUALS PAGE === */}
        {activePage === "visuals" && (
          <div className="fade-in">
            <h2 className="section-title" style={{ fontSize: 28 }}>{lang === "ar" ? "مكتبة الرسوم والإنفوغرافيك" : "Visual & Infographic Library"}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(450px, 1fr))", gap: 24 }}>
              {/* Chart 1 */}
              <div className="card hover-lift">
                <div className="badge" style={{ background: COLORS.red + "15", color: COLORS.red, marginBottom: 12 }}>
                  {lang === "ar" ? "رسم خطي" : "Line Chart"}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{t.settlersGrowth}</h3>
                <p style={{ fontSize: 12, color: COLORS.gray[500], marginBottom: 16 }}>
                  {lang === "ar" ? "من صفر إلى 750 ألف: المنحنى المتسارع" : "From zero to 750K: The accelerating curve"}
                </p>
                <div style={{ height: 280 }}>
                  <ResponsiveContainer>
                    <AreaChart data={STUDY_DATA.settlersGrowth}>
                      <defs>
                        <linearGradient id="sg2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={COLORS.red} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={COLORS.red} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gray[200]} />
                      <XAxis dataKey="year" tick={{ fontSize: 10 }} reversed={isRTL} />
                      <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}K`} tick={{ fontSize: 10 }} orientation={isRTL ? "right" : "left"} />
                      <Tooltip contentStyle={{ borderRadius: 10, border: "none" }} />
                      <Area type="monotone" dataKey="settlers" stroke={COLORS.red} strokeWidth={2.5} fill="url(#sg2)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2 */}
              <div className="card hover-lift">
                <div className="badge" style={{ background: COLORS.greenDark + "15", color: COLORS.greenDark, marginBottom: 12 }}>
                  {lang === "ar" ? "رسم دائري" : "Pie Chart"}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{t.spendingBreakdown}</h3>
                <p style={{ fontSize: 12, color: COLORS.gray[500], marginBottom: 16 }}>
                  {lang === "ar" ? "48.5-71.6 مليار دولار: أين ذهبت الأموال؟" : "$48.5-71.6B: Where did the money go?"}
                </p>
                <div style={{ height: 280 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={spendingPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={110} dataKey="value" paddingAngle={2}>
                        {spendingPieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 10 }} formatter={(v) => [`$${v.toFixed(1)}B`]} />
                      <Legend formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 3 */}
              <div className="card hover-lift">
                <div className="badge" style={{ background: COLORS.redLight + "15", color: COLORS.redLight, marginBottom: 12 }}>
                  {lang === "ar" ? "رسم أعمدة" : "Bar Chart"}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{t.violenceSurge}</h3>
                <p style={{ fontSize: 12, color: COLORS.gray[500], marginBottom: 16 }}>
                  {lang === "ar" ? "+451% في عقد واحد: تسارع أسّي" : "+451% in one decade: Exponential surge"}
                </p>
                <div style={{ height: 280 }}>
                  <ResponsiveContainer>
                    <BarChart data={STUDY_DATA.violenceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gray[200]} />
                      <XAxis dataKey="year" tick={{ fontSize: 10 }} reversed={isRTL} />
                      <YAxis tick={{ fontSize: 10 }} orientation={isRTL ? "right" : "left"} />
                      <Tooltip contentStyle={{ borderRadius: 10 }} />
                      <Bar dataKey="incidents" radius={[6, 6, 0, 0]}>
                        {STUDY_DATA.violenceData.map((e, i) => (
                          <Cell key={i} fill={e.year >= 2023 ? COLORS.red : e.year >= 2021 ? COLORS.redLight : COLORS.gray[400]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 4 */}
              <div className="card hover-lift">
                <div className="badge" style={{ background: COLORS.accent.sky + "15", color: COLORS.accent.sky, marginBottom: 12 }}>
                  {lang === "ar" ? "رسم مركّب" : "Composed Chart"}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{t.annualSpending}</h3>
                <p style={{ fontSize: 12, color: COLORS.gray[500], marginBottom: 16 }}>
                  {lang === "ar" ? "من 50 إلى 633 مليون $/سنة: تضاعف 12 مرة" : "From $50M to $633M/year: 12x increase"}
                </p>
                <div style={{ height: 280 }}>
                  <ResponsiveContainer>
                    <BarChart data={STUDY_DATA.spendingTimeline}>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gray[200]} />
                      <XAxis dataKey="period" tick={{ fontSize: 9 }} reversed={isRTL} />
                      <YAxis tick={{ fontSize: 10 }} orientation={isRTL ? "right" : "left"} />
                      <Tooltip contentStyle={{ borderRadius: 10 }} formatter={(v) => [`$${v}M`]} />
                      <Bar dataKey="annual" radius={[6, 6, 0, 0]}>
                        {STUDY_DATA.spendingTimeline.map((e, i) => (
                          <Cell key={i} fill={CHART_COLORS[i]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 5: Checkpoint Lifetime Losses */}
              <div className="card hover-lift" style={{ gridColumn: "1 / -1" }}>
                <div className="badge" style={{ background: COLORS.redDark + "15", color: COLORS.redDark, marginBottom: 12 }}>
                  {lang === "ar" ? "إنفوغرافيك تفاعلي" : "Interactive Infographic"}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
                  {lang === "ar" ? "خسائر الأعمار البشرية على الحواجز" : "Human Lifetime Losses at Checkpoints"}
                </h3>
                <p style={{ fontSize: 12, color: COLORS.gray[500], marginBottom: 8 }}>
                  {lang === "ar" ? "8.1 مليار ساعة = 13,200 حياة بشرية كاملة ضاعت في الانتظار (1967-2025)" : "8.1 billion hours = 13,200 full human lives lost waiting (1967-2025)"}
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
                  {[
                    { val: "8.1B", labelAr: "ساعة انتظار تراكمية", labelEn: "cumulative waiting hours", color: COLORS.red },
                    { val: "13,200", labelAr: "حياة بشرية كاملة", labelEn: "full human lives", color: COLORS.redDark },
                    { val: "$39.2B", labelAr: "تكلفة اقتصادية مباشرة", labelEn: "direct economic cost", color: COLORS.black },
                  ].map((s, i) => (
                    <div key={i} style={{ textAlign: "center", padding: 16, borderRadius: 14, background: s.color + "08", border: `1px solid ${s.color}15` }}>
                      <div style={{ fontSize: 28, fontWeight: 900, color: s.color }}>{s.val}</div>
                      <div style={{ fontSize: 11, color: COLORS.gray[600], marginTop: 4 }}>{lang === "ar" ? s.labelAr : s.labelEn}</div>
                    </div>
                  ))}
                </div>
                <div style={{ height: 320 }}>
                  <ResponsiveContainer>
                    <ComposedChart data={STUDY_DATA.checkpointLifetimeLoss}>
                      <defs>
                        <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={COLORS.red} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={COLORS.red} stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gray[200]} />
                      <XAxis dataKey={lang === "ar" ? "event" : "eventEn"} tick={{ fontSize: 9, fill: COLORS.gray[600] }} reversed={isRTL} angle={lang === "ar" ? 0 : 0} />
                      <YAxis yAxisId="hours" tick={{ fontSize: 10, fill: COLORS.red }} orientation={isRTL ? "right" : "left"}
                        label={{ value: lang === "ar" ? "مليار ساعة" : "Billion hours", angle: -90, position: "insideLeft", style: { fontSize: 10, fill: COLORS.red }, dx: isRTL ? 15 : -15 }} />
                      <YAxis yAxisId="cost" tick={{ fontSize: 10, fill: COLORS.black }} orientation={isRTL ? "left" : "right"}
                        label={{ value: lang === "ar" ? "مليار $" : "Billion $", angle: 90, position: "insideRight", style: { fontSize: 10, fill: COLORS.black }, dx: isRTL ? -15 : 15 }} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: "none", direction: isRTL ? "rtl" : "ltr" }}
                        formatter={(v, name) => [`${v} ${lang === "ar" ? "مليار" : "B"}`, name === "hours" ? (lang === "ar" ? "الساعات" : "Hours") : (lang === "ar" ? "التكلفة $" : "Cost $")]} />
                      <Bar yAxisId="hours" dataKey="hours" fill="url(#hoursGrad)" stroke={COLORS.red} strokeWidth={1} radius={[6, 6, 0, 0]} barSize={50} />
                      <Line yAxisId="cost" dataKey="cost" stroke={COLORS.black} strokeWidth={3} dot={{ r: 5, fill: COLORS.black }} type="monotone" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ marginTop: 12, padding: "12px 16px", borderRadius: 12, background: COLORS.red + "08", fontSize: 12, color: COLORS.gray[700], lineHeight: 1.8, direction: isRTL ? "rtl" : "ltr" }}>
                  {lang === "ar"
                    ? "💡 كل دقيقة انتظار على حاجز منذ 1967 = 15.4 سنة بشرية ضائعة. 68 امرأة أُجبرت على الولادة على الحواجز، أسفرت عن 4 وفيات أمهات و34 إجهاضاً."
                    : "💡 Every minute of checkpoint waiting since 1967 = 15.4 human years lost. 68 women forced to give birth at checkpoints, resulting in 4 maternal deaths and 34 miscarriages."}
                </div>
              </div>

              {/* Chart 6: Olive Trees vs Wine Industry */}
              <div className="card hover-lift" style={{ gridColumn: "1 / -1" }}>
                <div className="badge" style={{ background: COLORS.accent.olive + "15", color: COLORS.accent.olive, marginBottom: 12 }}>
                  {lang === "ar" ? "مقارنة صادمة" : "Shocking Comparison"}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
                  {lang === "ar" ? "الزيتون المقتلع مقابل النبيذ المزدهر" : "Uprooted Olives vs Thriving Wine"}
                </h3>
                <p style={{ fontSize: 12, color: COLORS.gray[500], marginBottom: 16 }}>
                  {lang === "ar" ? "800,000+ شجرة زيتون فلسطينية اقتُلعت بينما نمت 60+ معصرة نبيذ استيطانية من الصفر" : "800,000+ Palestinian olive trees uprooted while 60+ settlement wineries grew from zero"}
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                  <div style={{ padding: 16, borderRadius: 14, background: COLORS.accent.olive + "08", border: `1px solid ${COLORS.accent.olive}20`, textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: COLORS.gray[500], marginBottom: 4 }}>{lang === "ar" ? "🫒 أشجار زيتون فلسطينية مقتلعة" : "🫒 Palestinian olive trees uprooted"}</div>
                    <div style={{ fontSize: 32, fontWeight: 900, color: COLORS.accent.olive }}>800,000+</div>
                    <div style={{ fontSize: 11, color: COLORS.gray[500], marginTop: 4 }}>{lang === "ar" ? "52,300 في 2024 وحده (8× المعدل)" : "52,300 in 2024 alone (8× average)"}</div>
                  </div>
                  <div style={{ padding: 16, borderRadius: 14, background: COLORS.redDark + "08", border: `1px solid ${COLORS.redDark}20`, textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: COLORS.gray[500], marginBottom: 4 }}>{lang === "ar" ? "🍷 معاصر نبيذ استيطانية" : "🍷 Settlement wineries"}</div>
                    <div style={{ fontSize: 32, fontWeight: 900, color: COLORS.redDark }}>0 → 60+</div>
                    <div style={{ fontSize: 11, color: COLORS.gray[500], marginTop: 4 }}>{lang === "ar" ? "$50-80 مليون سنوياً / 3-5 مليون زجاجة" : "$50-80M yearly / 3-5M bottles"}</div>
                  </div>
                </div>
                <div style={{ height: 300 }}>
                  <ResponsiveContainer>
                    <ComposedChart data={STUDY_DATA.oliveVsWine}>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gray[200]} />
                      <XAxis dataKey="year" tick={{ fontSize: 10 }} reversed={isRTL} />
                      <YAxis yAxisId="olives" tick={{ fontSize: 10, fill: COLORS.accent.olive }} orientation={isRTL ? "right" : "left"}
                        label={{ value: lang === "ar" ? "آلاف الأشجار المقتلعة" : "Trees uprooted (thousands)", angle: -90, position: "insideLeft", style: { fontSize: 9, fill: COLORS.accent.olive }, dx: isRTL ? 15 : -15 }} />
                      <YAxis yAxisId="wine" tick={{ fontSize: 10, fill: COLORS.redDark }} orientation={isRTL ? "left" : "right"}
                        label={{ value: lang === "ar" ? "معاصر النبيذ" : "Wineries", angle: 90, position: "insideRight", style: { fontSize: 9, fill: COLORS.redDark }, dx: isRTL ? -15 : 15 }} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: "none", direction: isRTL ? "rtl" : "ltr" }} />
                      <Area yAxisId="olives" dataKey="olivesDestroyed" stroke={COLORS.accent.olive} fill={COLORS.accent.olive + "20"} strokeWidth={2.5} name={lang === "ar" ? "زيتون مقتلع (آلاف)" : "Olives uprooted (K)"} type="monotone" />
                      <Line yAxisId="wine" dataKey="wineries" stroke={COLORS.redDark} strokeWidth={3} dot={{ r: 5, fill: COLORS.redDark, stroke: "white", strokeWidth: 2 }} name={lang === "ar" ? "معاصر نبيذ" : "Wineries"} type="monotone" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ marginTop: 12, padding: "12px 16px", borderRadius: 12, background: COLORS.accent.olive + "08", fontSize: 12, color: COLORS.gray[700], lineHeight: 1.8, direction: isRTL ? "rtl" : "ltr" }}>
                  {lang === "ar"
                    ? "💡 معصرة بساغوت نمت 333 ضعفاً (3,000 → 1,000,000 زجاجة) في 22 عامًا. بومبيو زارها رسميًا 2020. بينما شجرة زيتون الوليجة (5,500 سنة - الأقدم بالعالم) مهددة بالاقتلاع لمسار الجدار."
                    : "💡 Psagot winery grew 333× (3K → 1M bottles) in 22 years. Pompeo visited it officially in 2020. Meanwhile, the Al-Walaja olive tree (5,500 years — world's oldest) is threatened by the wall's path."}
                </div>
              </div>

              {/* Chart 7: Container Journey Comparison */}
              <div className="card hover-lift">
                <div className="badge" style={{ background: COLORS.accent.sky + "15", color: COLORS.accent.sky, marginBottom: 12 }}>
                  {lang === "ar" ? "مقارنة لوجستية" : "Logistics Comparison"}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
                  {lang === "ar" ? "رحلة الحاوية: فلسطيني vs إسرائيلي" : "Container Journey: Palestinian vs Israeli"}
                </h3>
                <p style={{ fontSize: 12, color: COLORS.gray[500], marginBottom: 16 }}>
                  {lang === "ar" ? "نفس الميناء، ضعفين إلى ثلاثة أضعاف التكلفة والوقت" : "Same port, 2-3× the cost and time"}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {STUDY_DATA.containerJourney.map((item, i) => {
                    const maxVal = Math.max(item.pal, item.isr);
                    return (
                      <div key={i} style={{ direction: isRTL ? "rtl" : "ltr" }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.gray[700], marginBottom: 6 }}>
                          {lang === "ar" ? item.labelAr : item.labelEn}
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                              <span style={{ fontSize: 10, color: COLORS.gray[500], minWidth: 55 }}>🇵🇸 {lang === "ar" ? "فلسطيني" : "Palestinian"}</span>
                              <div style={{ flex: 1, background: COLORS.gray[100], borderRadius: 8, height: 24, overflow: "hidden" }}>
                                <div style={{ width: `${(item.pal / maxVal) * 100}%`, height: "100%", background: `linear-gradient(90deg, ${COLORS.red}, ${COLORS.redLight})`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingInline: 8 }}>
                                  <span style={{ fontSize: 11, fontWeight: 800, color: "white" }}>{item.pal}{item.category === "inspect" || item.category === "backtoback" ? "%" : "×"}</span>
                                </div>
                              </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ fontSize: 10, color: COLORS.gray[500], minWidth: 55 }}>🇮🇱 {lang === "ar" ? "إسرائيلي" : "Israeli"}</span>
                              <div style={{ flex: 1, background: COLORS.gray[100], borderRadius: 8, height: 24, overflow: "hidden" }}>
                                <div style={{ width: `${(item.isr / maxVal) * 100}%`, height: "100%", background: `linear-gradient(90deg, ${COLORS.accent.sky}, ${COLORS.accent.sky}aa)`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingInline: 8 }}>
                                  <span style={{ fontSize: 11, fontWeight: 800, color: "white" }}>{item.isr}{item.category === "inspect" || item.category === "backtoback" ? "%" : "×"}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 12, background: COLORS.accent.sky + "08", fontSize: 11, color: COLORS.gray[600], lineHeight: 1.8, direction: isRTL ? "rtl" : "ltr" }}>
                  {lang === "ar"
                    ? "📦 74% من التجارة الفلسطينية تمر عبر موانئ إسرائيلية حصرًا. لا يوجد ميناء فلسطيني واحد. $538 تكلفة إضافية لكل شحنة من التأخيرات الأمنية وحدها."
                    : "📦 74% of Palestinian trade goes through Israeli ports exclusively. No Palestinian port exists. $538 extra per shipment from security delays alone."}
                </div>
              </div>

              {/* Chart 8: Settler vs Citizen Spending */}
              <div className="card hover-lift">
                <div className="badge" style={{ background: COLORS.gold + "15", color: COLORS.gold, marginBottom: 12 }}>
                  {lang === "ar" ? "تمييز ممنهج" : "Systematic Discrimination"}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
                  {lang === "ar" ? "المستوطن vs المواطن الإسرائيلي" : "Settler vs Israeli Citizen"}
                </h3>
                <p style={{ fontSize: 12, color: COLORS.gray[500], marginBottom: 16 }}>
                  {lang === "ar" ? "2.65 ضعف الدعم الحكومي — ~$460,000 فارق تراكمي عبر العمر" : "2.65× government support — ~$460,000 lifetime cumulative gap"}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {STUDY_DATA.settlerVsCitizen.map((item, i) => {
                    const isRatio = item.cat === "overall" || item.cat === "roads" || item.cat === "transport";
                    const maxVal = Math.max(item.settler, item.citizen);
                    const settlerLabel = item.cat === "housing" ? (lang === "ar" ? "0-1%" : "0-1%") :
                      item.cat === "tax" ? "6%" :
                      item.cat === "education" ? "$2,160" :
                      item.cat === "transport" ? "25%" :
                      item.cat === "roads" ? "12.5×" : "2.65×";
                    const citizenLabel = item.cat === "housing" ? (lang === "ar" ? "4-6%" : "4-6%") :
                      item.cat === "tax" ? "12-25%" :
                      item.cat === "education" ? "$1,080" :
                      item.cat === "transport" ? "2%" :
                      item.cat === "roads" ? "1×" : "1×";
                    const settlerBetter = item.cat === "housing" || item.cat === "tax" ? item.settler < item.citizen : item.settler > item.citizen;
                    return (
                      <div key={i} style={{ direction: isRTL ? "rtl" : "ltr" }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.gray[700], marginBottom: 6 }}>
                          {lang === "ar" ? item.labelAr : item.labelEn}
                        </div>
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <div style={{ width: 70, fontSize: 10, color: COLORS.gray[500] }}>
                            {lang === "ar" ? "🏘️ مستوطن" : "🏘️ Settler"}
                          </div>
                          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 4 }}>
                            <div style={{ flex: 1, background: COLORS.gray[100], borderRadius: 8, height: 22, overflow: "hidden" }}>
                              <div style={{
                                width: `${(Math.max(item.settler, 0.5) / maxVal) * 100}%`,
                                height: "100%",
                                background: settlerBetter
                                  ? `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.goldLight})`
                                  : `linear-gradient(90deg, ${COLORS.greenDark}, ${COLORS.greenLight})`,
                                borderRadius: 8,
                              }} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 800, color: COLORS.gold, minWidth: 50, textAlign: "center" }}>{settlerLabel}</span>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 3 }}>
                          <div style={{ width: 70, fontSize: 10, color: COLORS.gray[500] }}>
                            {lang === "ar" ? "🏠 مواطن" : "🏠 Citizen"}
                          </div>
                          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 4 }}>
                            <div style={{ flex: 1, background: COLORS.gray[100], borderRadius: 8, height: 22, overflow: "hidden" }}>
                              <div style={{
                                width: `${(Math.max(item.citizen, 0.5) / maxVal) * 100}%`,
                                height: "100%",
                                background: `linear-gradient(90deg, ${COLORS.gray[400]}, ${COLORS.gray[300]})`,
                                borderRadius: 8,
                              }} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 800, color: COLORS.gray[500], minWidth: 50, textAlign: "center" }}>{citizenLabel}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 12, background: COLORS.gold + "08", fontSize: 11, color: COLORS.gray[600], lineHeight: 1.8, direction: isRTL ? "rtl" : "ltr" }}>
                  {lang === "ar"
                    ? "💰 طريق حوارة الالتفافي: $95 مليون لـ 7.5 كم فقط لخدمة 8,000 مستوطن = $11,875 للمستوطن الواحد. الدعم التراكمي عبر العمر: ~$460,000 إضافية للمستوطن."
                    : "💰 Huwara bypass: $95M for just 7.5km serving 8,000 settlers = $11,875 per settler. Lifetime cumulative support: ~$460,000 extra per settler."}
                </div>
              </div>

              {/* Infographic Card: 1:8 Ratio */}
              <div style={{
                gridColumn: "1 / -1",
                background: `linear-gradient(135deg, ${COLORS.black} 0%, ${COLORS.redDark} 100%)`,
                borderRadius: 20, padding: "40px 48px", color: "white",
                display: "flex", alignItems: "center", gap: 40,
              }}>
                <div style={{ flex: 1 }}>
                  <div className="badge" style={{ background: "rgba(255,255,255,0.15)", marginBottom: 16 }}>
                    {lang === "ar" ? "المعادلة المحورية" : "The Key Equation"}
                  </div>
                  <div style={{ fontSize: 72, fontWeight: 900, lineHeight: 1 }}>1:8</div>
                  <div style={{ fontSize: 18, opacity: 0.9, marginTop: 12, lineHeight: 1.7 }}>
                    {lang === "ar"
                      ? "كل دولار أنفقته إسرائيل على الاستيطان كلّف الفلسطينيين 8 دولارات من الخسائر"
                      : "Every dollar Israel spent on settlements cost Palestinians $8 in losses"}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 24 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 4 }}>{lang === "ar" ? "الإنفاق الإسرائيلي" : "Israeli Spending"}</div>
                    <div style={{ fontSize: 36, fontWeight: 900, color: COLORS.goldLight }}>$71.6B</div>
                  </div>
                  <div style={{ width: 2, background: "rgba(255,255,255,0.2)" }} />
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 4 }}>{lang === "ar" ? "الخسائر الفلسطينية" : "Palestinian Losses"}</div>
                    <div style={{ fontSize: 36, fontWeight: 900, color: COLORS.redLight }}>$572B</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ===== FOOTER ===== */}
      <footer style={{
        background: COLORS.black, color: "rgba(255,255,255,0.7)", padding: "40px 24px",
        marginTop: 48, textAlign: "center",
      }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 16 }}>
            {[COLORS.black, COLORS.red, COLORS.white, COLORS.green].map((c, i) => (
              <div key={i} style={{ width: 40, height: 6, background: c, borderRadius: 3, border: c === COLORS.white ? `1px solid ${COLORS.gray[400]}` : "none" }} />
            ))}
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "white", marginBottom: 8 }}>
            {STUDY_DATA.title[lang]} — {STUDY_DATA.subtitle[lang]}
          </div>
          <div style={{ fontSize: 12, opacity: 0.5 }}>
            {lang === "ar"
              ? "جميع البيانات مستخرجة من مصادر موثقة ومرجعية. المشروع مفتوح المصدر."
              : "All data extracted from documented and referenced sources. Open source project."}
          </div>
        </div>
      </footer>
    </div>
  );
}
