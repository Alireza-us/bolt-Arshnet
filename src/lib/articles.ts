export type LocalizedText = { en: string; fa: string };
export type LocalizedTextArray = { en: string[]; fa: string[] };

export type Article = {
  slug: string;
  category: LocalizedText;
  date: string;
  readingTime: number;
  title: LocalizedText;
  excerpt: LocalizedText;
  body: LocalizedTextArray;
};

export const ARTICLES: Article[] = [
  {
    slug: 'choosing-the-right-cameras-for-your-shop',
    category: { en: 'CCTV', fa: 'دوربین مداربسته' },
    date: '2026-10-20',
    readingTime: 5,
    title: {
      en: 'Choosing the right cameras for your shop',
      fa: 'انتخاب دوربین مناسب برای فروشگاه شما',
    },
    excerpt: {
      en: 'A practical guide to camera types, placement, and storage — without the jargon.',
      fa: 'راهنمای کاربردی برای انواع دوربین، محل نصب و ذخیره‌سازی — بدون اصطلاحات پیچیده.',
    },
    body: {
      en: [
        'The most common mistake small businesses make with CCTV is buying cameras before understanding what they need to see. A camera above the till is not the same as one covering a shop floor, and the choice between a dome, bullet, or PTZ camera depends entirely on the space.',
        'Start with a simple question: what do you want to protect, and what do you want to be able to review if something happens? This tells you how many cameras you need, where to place them, and how much storage to budget for.',
        'For most small shops, 4 to 8 IP cameras with night vision cover the key areas: entrance, till, stockroom, and shop floor. Hikvision and Ubiquiti both offer reliable options that are easy to expand later.',
        'Storage is the other half. A network video recorder with 30 days of retention is a good starting point for most businesses. I size the storage based on camera count, resolution, and how long you need to keep footage.',
        'Finally, make sure remote access is set up securely. Default passwords are the single biggest security hole in CCTV systems. I always change them, set up access control, and walk you through the phone app before handover.',
      ],
      fa: [
        'شایع‌ترین اشتباه کسب‌وکارهای کوچک در زمینه دوربین مداربسته، خرید دوربین قبل از درک نیازهایشان است. دوربینی بالای صندوق با دوربینی که فضای فروشگاه را پوشش می‌دهد یکی نیست، و انتخاب بین دوربین گنبدی، استوانه‌ای یا PTZ کاملاً به فضا بستگی دارد.',
        'با یک سوال ساده شروع کنید: چه چیزی را می‌خواهید محافظت کنید و در صورت وقوع اتفاقی چه چیزی را می‌خواهید بررسی کنید؟ این به شما می‌گوید چند دوربین نیاز دارید، کجا قرار دهید و چقدر ذخیره‌سازی در نظر بگیرید.',
        'برای اکثر فروشگاه‌های کوچک، ۴ تا ۸ دوربین IP با دید در شب نواحی کلیدی را پوشش می‌دهد: ورودی، صندوق، انبار و فضای فروشگاه. هایک ویژن و یوبیکوئیتی هر دو گزینه‌های قابل اعتمادی ارائه می‌دهند که بعداً به راحتی قابل توسعه است.',
        'ذخیره‌سازی نیمه دیگر است. یک ضبط‌کننده شبکه با ۳۰ روز نگهداری برای اکثر کسب‌وکارها نقطه شروع خوبی است. من ذخیره‌سازی را بر اساس تعداد دوربین، وضوح و مدت نگهداری تنظیم می‌کنم.',
        'در نهایت، مطمئن شوید دسترسی از راه دور به‌طور ایمن تنظیم شده است. رمزهای عبور پیش‌فرض بزرگترین حفره امنیتی در سیستم‌های دوربین است. من همیشه آن‌ها را تغییر می‌دهم، کنترل دسترسی را تنظیم می‌کنم و قبل از تحویل، اپلیکیشن تلفن را به شما آموزش می‌دهم.',
      ],
    },
  },
  {
    slug: 'voip-vs-traditional-lines-what-makes-sense',
    category: { en: 'VoIP', fa: 'تلفن اینترنتی' },
    date: '2026-10-12',
    readingTime: 4,
    title: {
      en: 'VoIP vs traditional phone lines: what makes sense',
      fa: 'تلفن اینترنتی در برابر خطوط سنتی: کدام منطقی‌تر است',
    },
    excerpt: {
      en: 'Why most small businesses save money and get more features by switching to VoIP.',
      fa: 'چرا اکثر کسب‌وکارهای کوچک با تغییر به VoIP پول ذخیره می‌کنند و امکانات بیشتری می‌گیرند.',
    },
    body: {
      en: [
        'Traditional copper phone lines were designed for a world where one line meant one call. If you needed more calls, you paid for more lines. VoIP changes that — your calls run over your internet connection, so adding users or features does not mean adding wires.',
        'The biggest advantage for small businesses is the auto-attendant (IVR). Instead of a receptionist routing every call, callers hear a simple menu: press 1 for sales, 2 for support, 3 for billing. It sounds professional and routes calls to the right person immediately.',
        'Cost is the other factor. SIP trunks are typically cheaper per channel than copper lines, and you only pay for what you use. For a clinic or shop taking 3 to 5 calls at once, the savings add up quickly.',
        'Call quality is the question I hear most. With QoS (quality of service) configured on your router, voice traffic is prioritised over everything else. On a decent internet connection, VoIP calls sound clearer than copper.',
        'The switch is straightforward: I set up 3CX or FreePBX, port your existing number to a SIP provider, provision your desk phones and mobile apps, and test everything before handover. Most businesses switch in a single day.',
      ],
      fa: [
        'خطوط سنتی مسی برای دنیایی طراحی شده بودند که در آن یک خط به معنای یک تماس بود. اگر تماس بیشتری نیاز داشتید، باید خط بیشتری می‌خرید. VoIP این را تغییر داد — تماس‌های شما از طریق اتصال اینترنت انجام می‌شود، پس افزودن کاربر یا امکان به معنای افزودن سیم نیست.',
        'بزرگترین مزیت برای کسب‌وکارهای کوچک، منشی تلفنی خودکار (IVR) است. به جای اینکه یک منشی هر تماس را هدایت کند، تماس‌گیرندگان یک منوی ساده می‌شنوند: برای فروش ۱، برای پشتیبانی ۲، برای حسابداری ۳ را بزنید. حرفه‌ای به نظر می‌رسد و تماس‌ها را فوراً به شخص مناسب هدایت می‌کند.',
        'هزینه عامل دیگر است. خطوط SIP معمولاً هر کانال ارزان‌تر از خطوط مسی است و فقط برای آنچه استفاده می‌کنید پرداخت می‌کنید. برای یک مطب یا فروشگاهی که همزمان ۳ تا ۵ تماس دریافت می‌کند، صرفه‌جویی سریعاً جمع می‌شود.',
        'کیفیت تماس پرسش متداولی است که بیشتر می‌شنوم. با تنظیم QoS روی روتر، ترافیک صوتی بر همه چیز دیگر اولویت می‌یابد. با یک اتصال اینترنت مناسب، تماس‌های VoIP واضح‌تر از خط مسی هستند.',
        'تغییر ساده است: من 3CX یا FreePBX را تنظیم می‌کنم، شماره فعلی شما را به یک ارائه‌دهنده SIP منتقل می‌کنم، تلفن‌های رومیزی و اپلیکیشن‌های موبایل را آماده می‌کنم و قبل از تحویل همه چیز را تست می‌کنم. اکثر کسب‌وکارها در یک روز تغییر می‌کنند.',
      ],
    },
  },
  {
    slug: 'fixing-wi-fi-dead-spots-in-your-office',
    category: { en: 'Network', fa: 'شبکه' },
    date: '2026-10-05',
    readingTime: 6,
    title: {
      en: 'Fixing Wi-Fi dead spots in your office',
      fa: 'رفع نقاط کور وای‌فای در دفتر شما',
    },
    excerpt: {
      en: 'Why your Wi-Fi drops in the back room — and how a proper survey fixes it.',
      fa: 'چرا وای‌فای در اتاق عقب قطع می‌شود — و چگونه یک بررسی صحیح آن را حل می‌کند.',
    },
    body: {
      en: [
        'If your Wi-Fi works at the front of the office but drops in the back room or warehouse, the problem is almost never your internet speed. It is coverage. Walls, shelving, and metal partitions block Wi-Fi signals more than most people realise.',
        'The fix starts with a Wi-Fi survey. I walk your premises with a signal-strength meter, mapping where coverage is strong and where it drops off. This shows exactly where access points need to go.',
        'A common mistake is buying a single powerful router and expecting it to cover everything. A better approach is multiple access points placed strategically, so every area gets a strong, consistent signal. UniFi access points are designed for exactly this.',
        'Placement matters more than power. An access point in the right spot at lower power outperforms a powerful one in the wrong location. I position access points to avoid interference from walls and metal, and to overlap coverage slightly so devices switch seamlessly.',
        'If you also need guest Wi-Fi, I set up a separate network so visitors never touch your business systems. A MikroTik or UniFi firewall handles this cleanly with VLAN separation.',
        'Once everything is installed, I test speed and signal throughout your premises, document the setup, and add it to your monthly support plan so coverage stays solid as your business grows.',
      ],
      fa: [
        'اگر وای‌فای در جلوی دفتر کار می‌کند اما در اتاق عقب یا انبار قطع می‌شود، مشکل تقریباً هرگز سرعت اینترنت نیست. بلکه پوشش است. دیوارها، قفسه‌ها و پارتیشن‌های فلزی سیگنال وای‌فای را بیشتر از آنچه تصور می‌کنید مسدود می‌کنند.',
        'راه‌حل با بررسی وای‌فای شروع می‌شود. من با یک اندازه‌گیر قدرت سیگنال در محیط شما قدم می‌زنم و نقاط قوی و ضعیف پوشش را ثبت می‌کنم. این دقیقاً نشان می‌دهد نقاط دسترسی کجا باید باشند.',
        'یک اشتباه رایج خرید یک روتر قدرتمند و انتظار پوشش همه‌جا است. رویکرد بهتر، چندین نقطه دسترسی استراتژیک است، تا هر ناحیه سیگنال قوی و پایدار بگیرد. نقاط دسترسی UniFi دقیقاً برای همین طراحی شده‌اند.',
        'محل قرارگیری از قدرت مهم‌تر است. یک نقطه دسترسی در محل مناسب با قدرت کم، بهتر از یک نقطه قدرتمند در محل اشتباه عمل می‌کند. من نقاط دسترسی را طوری قرار می‌دهم که از تداخل دیوار و فلز جلوگیری شود و پوشش کمی همپوشانی داشته باشد.',
        'اگر به وای‌فای مهمان هم نیاز دارید، یک شبکه جداگانه تنظیم می‌کنم تا بازدیدکنندگان هرگز سیستم‌های کسب‌وکار شما را لمس نکنند. یک فایروال MikroTik یا UniFi این کار را با جداسازی VLAN انجام می‌دهد.',
        'پس از نصب همه چیز، سرعت و سیگنال را در کل محیط تست می‌کنم، تنظیمات را مستندسازی می‌کنم و آن را به برنامه پشتیبانی ماهانه اضافه می‌کنم تا پوشش با رشد کسب‌وکار شما پایدار بماند.',
      ],
    },
  },
  {
    slug: 'what-a-monthly-support-plan-actually-covers',
    category: { en: 'Support', fa: 'پشتیبانی' },
    date: '2026-09-28',
    readingTime: 3,
    title: {
      en: 'What a monthly support plan actually covers',
      fa: 'برنامه پشتیبانی ماهانه واقعاً چه چیزی را پوشش می‌دهد',
    },
    excerpt: {
      en: 'A plain explanation of what you get — and what you do not — with a support plan.',
      fa: 'توضیح ساده آنچه دریافت می‌کنید — و آنچه دریافت نمی‌کنید — با برنامه پشتیبانی.',
    },
    body: {
      en: [
        'A monthly support plan is not insurance against everything that could go wrong. It is a relationship: you pay a fixed monthly fee, and in return you get priority response, monitoring, and proactive maintenance that keeps small problems from becoming big ones.',
        'The core of every plan is remote helpdesk support. When something breaks, you call one number and get help — often the same day. No ticket queues, no waiting days for a response from someone who does not know your setup.',
        'Beyond helpdesk, the higher tiers add monitoring and alerts. This means I can see when a router is struggling or a backup has not run, and fix it before you notice anything is wrong.',
        'Firmware updates and security patches are included on Business and Priority plans. Old firmware is one of the most common causes of network issues, and keeping it current is one of the most boring but valuable things a support plan does.',
        'What a plan does not cover: new hardware, major installations, or problems caused by third-party changes (like your internet provider changing your IP). Those are quoted separately. But the plan means when those things happen, you have someone to call who already knows your network.',
      ],
      fa: [
        'برنامه پشتیبانی ماهانه بیمه در برابر همه چیز نیست. یک رابطه است: شما هزینه ماهانه ثابتی پرداخت می‌کنید و در عوض پاسخوییت اولویت‌دار، مانیتورینگ و نگهداری پیشگیرانه دریافت می‌کنید که مشکلات کوچک را به مشکلات بزرگ تبدیل نمی‌کند.',
        'هسته هر برنامه، پشتیبانی رومیزی از راه دور است. وقتی چیزی خراب می‌شود، یک شماره را تماس می‌گیرید و کمک می‌گیرید — اغلب همان روز. بدون صف تیکت، بدون انتظار روزها برای پاسخ از کسی که تنظیمات شما را نمی‌شناسد.',
        'فراتر از پشتیبانی، سطوح بالاتر مانیتورینگ و هشدار اضافه می‌کنند. یعنی من می‌توانم ببینم کی روتر دچار مشکل شده یا بکاپ اجرا نشده و قبل از اینکه شما متوجه شوید آن را حل کنم.',
        'به‌روزرسانی فریم‌ور و وصله‌های امنیتی در برنامه‌های Business و Priority گنجانده شده است. فریم‌ور قدیمی یکی از شایع‌ترین دلایل مشکلات شبکه است و به‌روز نگه‌داشتن آن یکی از خسته‌کننده‌ترین اما ارزشمندترین کارهایی است که برنامه پشتیبانی انجام می‌دهد.',
        'آنچه برنامه پوشش نمی‌دهد: سخت‌افزار جدید، نصب‌های بزرگ، یا مشکلات ناشی از تغییرات شخص ثالث (مانند تغییر IP توسط ارائه‌دهنده اینترنت). این موارد جداگانه قیمت‌گذاری می‌شوند. اما برنامه یعنی وقتی این اتفاقات می‌افتد، کسی را دارید که شبکه شما را می‌شناسد.',
      ],
    },
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

export function getRelatedArticles(slug: string, count = 2): Article[] {
  const current = getArticleBySlug(slug);
  if (!current) return ARTICLES.slice(0, count);
  const sameCategory = ARTICLES.filter(
    (a) => a.slug !== slug && a.category.en === current.category.en,
  );
  const others = ARTICLES.filter(
    (a) => a.slug !== slug && a.category.en !== current.category.en,
  );
  return [...sameCategory, ...others].slice(0, count);
}
