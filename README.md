# نور | Noor

**حقوق النشر © 2026 el3mm_mesoo** · Copyright (c) 2026 el3mm_mesoo

Instagram: [@el3mm_mesoo](https://www.instagram.com/el3mm_mesoo/)

## صدقة جارية | Sadaqah Jariyah

هذا العمل **صدقة جارية عن أرواح جميع موتى المسلمين**. اللهم اغفر لهم وارحمهم وعافهم واعف عنهم، ونوّر قبورهم ووسّع مدخلهم. من انتفع به فليدعُ لهم.

This project is an ongoing charity (sadaqah jariyah) on behalf of all deceased Muslims. Anyone who benefits from it is asked to make du'a for them. The dedication must be kept with any copy (see LICENSE).


## تنبيه مهم | Important notice
النصوص الدينية (القرآن، التفسير، الأذكار وعزوها ودرجاتها) **رُوجعت مقابل مصادر مرجعية (مقارنة برمجية)** ولم تخضع بعد **لمراجعة نهائية من عالم شرعي**. المفتوح: عزو آية الكرسي (صباحًا/مساءً للحاكم، وبعد الصلاة للنسائي في الكبرى) لم يُتحقق منه، وألفاظ تسجيلات الأذان لم تُراجع سمعيًا. التفاصيل في `VERIFICATION.md`.

The religious texts were checked programmatically against reference sources but have NOT had a final scholarly review. Open items: Ayat al-Kursi attribution, and the wording of the adhan recordings.

## ما هو؟
تطبيق وموقع عربي (RTL) يضم: مواقيت الصلاة وتنبيهاتها، الأذان بأربعة أصوات، الأذكار (صباح، مساء، بعد الصلاة، نوم، استيقاظ، متنوعة)، القرآن الكريم مع التفسير والتلاوة بثمانية قراء، المسبحة، اتجاه القبلة، التاريخ الهجري.

## النسخ
| النسخة | المجلد | الحالة |
|---|---|---|
| المتصفح / PWA | `web/` | جاهزة وتعمل. شغّلها: `cd web && python3 -m http.server 8000` |
| أندرويد | `native/android` | بُني APK تجريبي و AAB غير موقّع (Capacitor). التوقيع والنشر على حسابك |
| آيفون | `native/ios` | مشروع Xcode جاهز، لم يُبنَ (يحتاج Mac وحساب Apple Developer) |

## البناء
```
cd native && npm ci
npx cap sync android && cd android && ./gradlew assembleDebug     # JDK 21 + Android SDK 35
npx cap sync ios && npx cap open ios                               # على Mac
```
اختبارات: `node tests/prayer.test.js` و `node tests/e2e.js` (يحتاج Chrome). تقارير التحقق من المصادر في `verification/`.

## المصادر والتحقق
انظر `VERIFICATION.md` و `CREDITS.md`. **المراجعة الشرعية النهائية من جهة علمية مختصة (الأزهر/دار الإفتاء) لم تتم بعد وهي شرط قبل النشر العام.**
