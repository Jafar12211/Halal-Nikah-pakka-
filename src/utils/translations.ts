import { LanguageCode } from '../types/database';

export const normalizeLanguageCode = (value: unknown): LanguageCode =>
  value === 'te' || value === 'ur' ? value : 'en';

export const translations: Record<LanguageCode, Record<string, string>> = {
  en: {
    // Navigation
    brandTitle: 'NIKAH PAKKA',
    brandSubtitle: 'Yanam & Godavari Muslim Matrimony',
    navMatches: 'Browse Matches',
    navWhyUs: 'Why Nikah Pakka',
    navMessaging: 'Family Chat',
    navAdmin: 'Admin Dashboard',
    navDuas: "Du'as & Sunnah",
    navFAQs: 'FAQs',
    btnRegister: 'Register Free',
    btnLogin: 'Sign In',
    btnMyAccount: 'My Profile',
    btnSignOut: 'Sign Out',
    shareBarakah: 'Share Barakah',

    // Hero
    bismillah: 'Bismillahir Rahmanir Raheem',
    heroTag: 'Godavari & Yanam Muslim Matrimony',
    heroHeadline: 'A Blessed Beginning for Godavari & Yanam Muslim Matrimony',
    heroSub: 'A community matrimony directory for families across Yanam, Kakinada, Rajahmundry, Konaseema, Bhimavaram, and Eluru. Registration is currently free; families should independently confirm profile details.',
    btnStartFree: 'Register Candidate Free',
    btnExploreCommunity: 'Explore Local Matches',

    // Filters
    filterLookingFor: 'Looking For',
    filterAll: 'All Candidates',
    filterBrides: 'Muslim Bride (Dulhan)',
    filterGrooms: 'Muslim Groom (Dulha)',
    filterDistrict: 'District / Region',
    filterAllDistricts: 'All Godavari & Yanam Districts',
    filterAge: 'Max Age',
    btnSearchMatches: 'Browse Approved Profiles',

    // Pillars
    pillarPWA: 'PWA Mobile App Ready',
    pillarFamily: 'Family involvement encouraged',
    pillarVerification: 'Administrator review required',
    pillarDealbreakers: 'Deal-Breakers & Must-Haves',

    // Directory
    directoryTitle: 'Approved Community Profiles',
    directorySub: 'Candidates from Yanam, Kakinada, Rajahmundry, Konaseema, Bhimavaram, and Eluru.',
    viewBiodata: 'View Full Biodata',
    sendKhabar: 'Express Interest',
    interested: 'Saved on this device',
    startChat: 'Messaging not yet available',
    e2eeBadge: 'Not yet enabled',
    waliIncluded: 'Family involvement encouraged',

    // Profile detail
    bismillahHeader: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ · Candidate Matrimonial Biodata',
    candidateSummary: 'Candidate Summary & Character',
    deenLifestyle: 'Deen, Salah & Religious Observance',
    educationCareer: 'Education & Career',
    familyBackground: 'Family Background & Lineage',
    partnerExpectations: 'Partner Preferences (Tawafuq)',
    mustHavesTitle: 'Non-Negotiable Must-Haves',
    dealBreakersTitle: 'Strict Deal-Breakers',
    guardianContact: 'Guardian Contact Details (Private)',
    copyBiodata: 'Copy Full Biodata',
    shareWhatsApp: 'Forward on WhatsApp',

    // Messaging
    chatTitle: 'Family Messaging Preview',
    chatEncryptedNotice: 'Messaging is not enabled yet. No messages can currently be sent through this website.',
    waliNotice: 'Family involvement is encouraged. Arrange introductions through contact details your family has independently verified.',
    quickQuestions: 'Quick Inquiries:',
    qDeen: 'Please share your daily Salah and Quran routine.',
    qFamily: 'Would you be open to an elder-accompanied meeting in Godavari?',
    qRelocation: 'Are you open to settling in Yanam / Godavari districts?',
    typeMessagePlaceholder: 'Type a respectful, deen-conscious message...',
    btnSend: 'Messaging unavailable',

    // Admin
    adminTitle: 'Protected Administrator Dashboard',
    adminSub: 'Administrator profile review and community safety controls.',
    metricTotal: 'Total Users',
    metricPending: 'Pending Review',
    metricApproved: 'Approved Matches',
    metricSuspended: 'Suspended Accounts',
    btnApprove: 'Approve Profile',
    btnReject: 'Reject Profile',
    btnSuspend: 'Suspend User',
    auditLogs: 'System Security Audit Trail',

    // PWA & Install
    installApp: 'Install Android PWA App',
    installSub: 'Install Nikah Pakka directly on your phone home screen without app store fees.',
    installNow: 'Install App',

    // Footer
    footerDua: 'May Allah bless every genuine search with a righteous partner. Ameen! 🤲',
    footerCopyright: '© 2026 Nikah Pakka. Dedicated to Muslim families of Yanam and the Godavari districts.',
  },

  te: {
    // Navigation
    brandTitle: 'నికాహ్ పక్కా',
    brandSubtitle: 'యానాం & గోదావరి ముస్లిం మ్యాట్రిమోనీ',
    navMatches: 'సంబంధాలు చూడండి',
    navWhyUs: 'మా ప్రత్యేకత',
    navMessaging: 'కుటుంబ సంభాషణ',
    navAdmin: 'అడ్మిన్ డాష్‌బోర్డ్',
    navDuas: 'దువాలు & సున్నత్',
    navFAQs: 'ప్రశ్నోత్తరాలు',
    btnRegister: 'ఉచిత రిజిస్ట్రేషన్',
    btnLogin: 'లాగిన్',
    btnMyAccount: 'నా ప్రొఫైల్',
    btnSignOut: 'లాగౌట్',
    shareBarakah: 'షేర్ చేయండి',

    // Hero
    bismillah: 'బిస్మిల్లాహిర్ రహ్మానిర్ రహీమ్',
    heroTag: 'గోదావరి & యానాం ముస్లిం వివాహ వేదిక',
    heroHeadline: 'యానాం మరియు గోదావరి జిల్లాల ముస్లింల నమ్మకమైన మ్యాట్రిమోనీ',
    heroSub: 'యానాం, కాకినాడ, రాజమండ్రి, కోనసీమ, భీమవరం, ఏలూరు ప్రాంతాల కుటుంబాల కోసం కమ్యూనిటీ మ్యాట్రిమోనీ డైరెక్టరీ. ప్రస్తుతం నమోదు ఉచితం; ప్రొఫైల్ వివరాలను కుటుంబాలు స్వయంగా నిర్ధారించుకోవాలి.',
    btnStartFree: 'ఉచితంగా రిజిస్టర్ అవ్వండి',
    btnExploreCommunity: 'స్థానిక సంబంధాలను చూడండి',

    // Filters
    filterLookingFor: 'కోరుకునేది',
    filterAll: 'అన్ని ప్రొఫైల్స్',
    filterBrides: 'ముస్లిం వధువు (దుల్హన్)',
    filterGrooms: 'ముస్లిం వరుడు (దుల్హా)',
    filterDistrict: 'జిల్లా / ప్రాంతం',
    filterAllDistricts: 'అన్ని గోదావరి & యానాం ప్రాంతాలు',
    filterAge: 'గరిష్ట వయస్సు',
    btnSearchMatches: 'వెతకండి',

    // Pillars
    pillarPWA: 'యాండ్రాయిడ్ PWA యాప్',
    pillarFamily: 'కుటుంబ భాగస్వామ్యం ప్రోత్సహించబడుతుంది',
    pillarVerification: 'అడ్మిన్ సమీక్ష అవసరం',
    pillarDealbreakers: 'షరతులు & ప్రాధాన్యతలు',

    // Directory
    directoryTitle: 'ఆమోదించిన వివాహ ప్రొఫైళ్లు',
    directorySub: 'యానాం, కాకినాడ, రాజమండ్రి, అమలాపురం, భీమవరం, ఏలూరు నుంచి స్థానిక కుటుంబాలు.',
    viewBiodata: 'పూర్తి బయోడేటా చూడండి',
    sendKhabar: 'ఆసక్తిని తెలపండి',
    interested: 'ఈ పరికరంలో సేవ్ చేయబడింది',
    startChat: 'మెసేజింగ్ ఇంకా అందుబాటులో లేదు',
    e2eeBadge: 'ఇంకా ప్రారంభం కాలేదు',
    waliIncluded: 'కుటుంబ భాగస్వామ్యం ప్రోత్సహించబడుతుంది',

    // Profile detail
    bismillahHeader: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ · అభ్యర్థి వైవాహిక వివరాలు',
    candidateSummary: 'అభ్యర్థి వివరాలు & స్వభావం',
    deenLifestyle: 'దీన్, నమాజ్ & జీవన విధానం',
    educationCareer: 'విద్య & ఉద్యోగం',
    familyBackground: 'కుటుంబ నేపథ్యం & పెద్దల వివరాలు',
    partnerExpectations: 'జీవిత భాగస్వామి ప్రాధాన్యతలు',
    mustHavesTitle: 'ఖచ్చితంగా ఉండవలసిన లక్షణాలు',
    dealBreakersTitle: 'అస్సలు అంగీకరించని విషయాలు (డీల్‌బ్రేకల్స్)',
    guardianContact: 'సంరక్షకుల సంప్రదింపు వివరాలు (ప్రైవేట్)',
    copyBiodata: 'బయోడేటా కాపీ చేయండి',
    shareWhatsApp: 'వాట్సాప్‌లో పంపండి',

    // Messaging
    chatTitle: 'కుటుంబ మెసేజింగ్ ప్రివ్యూ',
    chatEncryptedNotice: 'మెసేజింగ్ ఇంకా ప్రారంభం కాలేదు. ప్రస్తుతం ఈ వెబ్‌సైట్ ద్వారా సందేశాలు పంపడం సాధ్యం కాదు.',
    waliNotice: 'కుటుంబ భాగస్వామ్యాన్ని ప్రోత్సహిస్తున్నాము. కుటుంబం స్వయంగా నిర్ధారించిన సంప్రదింపు వివరాల ద్వారా పరిచయాలు చేసుకోండి.',
    quickQuestions: 'ముఖ్యమైన ప్రశ్నలు:',
    qDeen: 'మీ రోజువారీ నమాజ్ మరియు ఖురాన్ పఠనం గురించి చెప్పండి.',
    qFamily: 'గోదావరిలో కుటుంబ పెద్దలతో కలవడానికి అనుకూలమేనా?',
    qRelocation: 'యానాం / గోదావరి జిల్లాల్లో స్థిరపడటానికి ఇష్టమేనా?',
    typeMessagePlaceholder: 'గౌరవప్రదమైన సందేశాన్ని టైప్ చేయండి...',
    btnSend: 'మెసేజింగ్ అందుబాటులో లేదు',

    // Admin
    adminTitle: 'రక్షిత అడ్మిన్ డాష్‌బోర్డ్',
    adminSub: 'అడ్మిన్ ప్రొఫైల్ సమీక్ష మరియు కమ్యూనిటీ భద్రతా నియంత్రణలు.',
    metricTotal: 'మొత్తం సభ్యులు',
    metricPending: 'సమీక్షలో ఉన్నవి',
    metricApproved: 'ఆమోదించబడినవి',
    metricSuspended: 'నిలిపివేసినవి',
    btnApprove: 'ఆమోదించండి',
    btnReject: 'తిరస్కరించండి',
    btnSuspend: 'ఖాతా నిలిపివేయండి',
    auditLogs: 'భద్రతా ఆడిట్ రికార్డులు',

    // PWA & Install
    installApp: 'యాప్ ఇన్‌స్టాల్ చేసుకోండి',
    installSub: 'ప్లే స్టోర్ అవసరం లేకుండా నికాహ్ పక్కా యాప్‌ను మీ ఫోన్ స్క్రీన్ పై ఉంచుకోండి.',
    installNow: 'ఇన్‌స్టాల్ చేయండి',

    // Footer
    footerDua: 'అల్లాహ్ ప్రతి ఒక్కరికీ మంచి జీవిత భాగస్వామిని ప్రసాదించుగాక. ఆమీన్! 🤲',
    footerCopyright: '© 2026 నికాహ్ పక్కా. యానాం మరియు గోదావరి జిల్లాల ముస్లింల సేవలో.',
  },
  ur: {
    // Navigation
    brandTitle: "نکاح پکا",
    brandSubtitle: "یانم اور گوداوری مسلم میٹرومونی",
    navMatches: "رشتے تلاش کریں",
    navWhyUs: "ہمیں کیوں منتخب کریں",
    navMessaging: "خاندانی بات چیت",
    navAdmin: "ایڈمن ڈیش بورڈ",
    navDuas: "دعائیں اور سنت",
    navFAQs: "عام سوالات",
    btnRegister: "مفت رجسٹریشن",
    btnLogin: "لاگ ان کریں",
    btnMyAccount: "میرا پروفائل",
    btnSignOut: "لاگ آؤٹ",
    shareBarakah: "شیئر کریں",

    // Hero
    bismillah: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    heroTag: "گوداوری اور یانم مسلم میٹریمونی",
    heroHeadline: "یانم اور گوداوری مسلم خاندانوں کے لیے بابرکت آغاز",
    heroSub: "یانم، کاکیناڈا، راجہ مندری، کوناسیما، بھیماورم، اور ایلورو کے خاندانوں کے لیے کمیونٹی میٹریمونی ڈائریکٹری۔ رجسٹریشن فی الحال مفت ہے؛ خاندان آزادانہ طور پر پروفائل کی تفصیلات کی تصدیق کریں۔",
    btnStartFree: "امیدوار رجسٹر کریں",
    btnExploreCommunity: "مقامی رشتے دیکھیں",

    // Filters
    filterLookingFor: "تلاش برائے",
    filterAll: "تمام امیدوار",
    filterBrides: "مسلم دلہن",
    filterGrooms: "مسلم دولہا",
    filterDistrict: "ضلع / علاقہ",
    filterAllDistricts: "تمام گوداوری اور یانم اضلاع",
    filterAge: "زیادہ سے زیادہ عمر",
    btnSearchMatches: "منظور شدہ پروفائلز دیکھیں",

    // Pillars
    pillarPWA: "اینڈرائیڈ PWA ایپ",
    pillarFamily: "خاندانی شمولیت کی ترغیب",
    pillarVerification: "ایڈمن کا جائزہ لازمی",
    pillarDealbreakers: "شرائط و ترجیحات",

    // Directory
    directoryTitle: "منظور شدہ کمیونٹی پروفائلز",
    directorySub: "یانم، کاکیناڈا، راجہ مندری، کوناسیما، بھیماورم، اور ایلورو کے امیدوار۔",
    viewBiodata: "مکمل بائیو ڈیٹا دیکھیں",
    sendKhabar: "دلچسپی کا اظہار کریں",
    interested: "اس ڈیوائس پر محفوظ ہے",
    startChat: "میسجنگ ابھی دستیاب نہیں ہے",
    e2eeBadge: "ابھی فعال نہیں ہے",
    waliIncluded: "خاندانی شمولیت کی ترغیب",

    // Profile detail
    bismillahHeader: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ · امیدوار کا ازدواجی بائیو ڈیٹا",
    candidateSummary: "امیدوار کا خلاصہ اور کردار",
    deenLifestyle: "دین، نماز اور طرزِ زندگی",
    educationCareer: "تعلیم اور پیشہ",
    familyBackground: "خاندانی پس منظر اور بزرگوں کی تفصیلات",
    partnerExpectations: "شریکِ حیات کی ترجیحات (توافق)",
    mustHavesTitle: "لازمی خصوصیات",
    dealBreakersTitle: "ناقابلِ قبول باتیں (ڈیل بریکرز)",
    guardianContact: "سرپرست (ولی) کا رابطہ نمبر (نجی)",
    copyBiodata: "مکمل بائیو ڈیٹا کاپی کریں",
    shareWhatsApp: "واٹس ایپ پر بھیجیں",

    // Messaging
    chatTitle: "خاندانی میسجنگ پیش منظر",
    chatEncryptedNotice: "میسجنگ فی الحال فعال نہیں ہے۔ اس ویب سائٹ کے ذریعے پیغامات نہیں بھیجے جا سکتے۔",
    waliNotice: "خاندانی شمولیت کی پرزور ترغیب دی جاتی ہے۔ خاندانی طور پر تصدیق شدہ رابطوں سے رابطہ کریں۔",
    quickQuestions: "ضروری سوالات:",
    qDeen: "براہ کرم اپنی روزانہ کی نماز اور تلاوتِ قرآن کا معمول شیئر کریں۔",
    qFamily: "کیا آپ گوداوری میں بزرگوں کے ساتھ ملاقات کے لیے تیار ہیں؟",
    qRelocation: "کیا آپ یانم / گوداوری اضلاع میں سکونت اختیار کرنے کے لیے راضی ہیں؟",
    typeMessagePlaceholder: "احترام کے ساتھ باوقار پیغام لکھیں...",
    btnSend: "میسجنگ دستیاب نہیں ہے",

    // Admin
    adminTitle: "محفوظ ایڈمنسٹریٹر ڈیش بورڈ",
    adminSub: "ایڈمن پروفائل جائزہ اور کمیونٹی کے تحفظ کے کنٹرولز۔",
    metricTotal: "کل ارکان",
    metricPending: "زیرِ جائزہ",
    metricApproved: "منظور شدہ",
    metricSuspended: "معطل شدہ",
    btnApprove: "پروفائل منظور کریں",
    btnReject: "پروفائل مسترد کریں",
    btnSuspend: "اکاؤنٹ معطل کریں",
    auditLogs: "سسٹم سیکیورٹی آڈٹ ریکارڈز",

    // PWA & Install
    installApp: "اینڈرائیڈ PWA ایپ انسٹال کریں",
    installSub: "نکاح پکا کو ایپ اسٹور فیس کے بغیر براہ راست اپنی ہوم اسکرین پر انسٹال کریں۔",
    installNow: "ایپ انسٹال کریں",

    // Footer
    footerDua: "اللہ تعالیٰ ہر مخلص تلاش کو نیک و صالح شریکِ حیات عطا فرمائے۔ آمین! 🤲",
    footerCopyright: "© 2026 نکاح پکا۔ یانم اور گوداوری کے مسلم خاندانوں کی خدمت میں۔",
  },
};
