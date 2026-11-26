# Source verification (25 Nov 2026)

This is an automated comparison against independent reference sources, run by the build tooling. It is NOT a scholarly review (see "Not done").

## Quran text (6236 ayahs, 114 surahs)
- Text: alquran.cloud edition `quran-uthmani`. Ayah count per surah and total 6236 match.
- Cross-check: all 6236 ayahs compared with Quran.com (`verses/imlaei`) after stripping diacritics and long-vowel spelling differences. Worst similarity 0.889, none below 0.85 (differences are Uthmani vs Imlaei spelling). Script: `verification/verify_quran.py`, output `verification/quran_verify.txt`.
- Not verified: exact diacritics/tajweed marks character by character against a printed Madinah mushaf.

## Tafsir
- Al-Tafsir al-Waseet (Tantawi): chapters 1, 36, 112, 114 are identical (similarity 1.0) to Quran.com tafsir resource 93 "Al-Tafsir al-Wasit (Tantawi)". 
- Tafsir al-Muyassar: similarity 0.865 to 1.0 against Quran.com resource 16 on the same chapters. Differences are in wording/formatting between editions; the cause was not investigated.
- Tafsir al-Jalalayn: ayah count 6236 checked; no second source comparison done.
- Only 4 of 114 chapters were compared for tafsir. See `verification/tafsir_verify.txt`.

## Adhkar (41 items)
- Compared with the Hisn al-Muslim dataset github.com/rn0x/Adhkar-json: 36 of 41 match as exact text; the other 5 differ only by spelling (e.g. يئوده/يؤوده in Ayat al-Kursi) or because the reference merges the three surahs into one item. Script: `verification/verify_adhkar.py`.
- Counts: two items use counts that differ from the reference (10x tahlil in the morning, 7x Hasbiya); both are reported narrations, grading of the Hasbiya addition (Abu Dawud, mawquf) is disputed among scholars.
- The attribution line on each item (Bukhari, Muslim, ...) was written by the app author's tooling from memory and checked only where the reference dataset carries it. Needs a check against the hadith books.

## Prayer times
- Cairo, 25 Nov 2026 equals Dar al-Ifta's published times to the minute, except Dhuhr (11:43 vs 11:42). Other cities use the same formula but were checked only for plausibility. Test: `tests/prayer.test.js`.

## Not done (needs a human)
- Review by a qualified scholar or body (Al-Azhar / Dar al-Ifta) of the adhkar text, hadith grading, tafsir selection and the app's rulings.
- Listening check of the four adhan recordings (wording, e.g. whether any includes the Fajr "الصلاة خير من النوم"), the app does not use a separate Fajr adhan.
- Real-device tests (Android phone, iPhone), closed-app notification reliability, iOS build.

## Full verification (Nov 26)
- Quran text: compared all 6236 ayahs with Quran.com Uthmani and the King Fahd Complex Hafs file. 5 real fixes (2:181, 8:6, 13:37, 12:39, 12:41). Quran.com 6236/6236. King Fahd 6233/6236, the 3 left are word-spacing conventions (15:7, 27:20, 36:22).
- Tafsir, 114 chapters: Muyassar equals the King Fahd Complex Muyassar file 6236/6236. Jalalayn equals Tanzil's 6236/6236. Waseet: 5954/6082 exact vs Quran.com data, 128 empty entries are grouped ayahs (UI shows the shared text).
- Adhkar: every item checked against Bukhari, Muslim, Abu Dawud, Tirmidhi, Ibn Majah (fawazahmed0 hadith data) with Albani/Arnaut/Zai grades. Source lines corrected. Not verifiable here: Hakim (Ayat al-Kursi morning/evening) and Nasa'i al-Kubra (after prayer), marked as such. Hasbiya x7 marked disputed.
- Adhan audio wording: NOT verified. Needs a human listener.
- Everything still needs review by a qualified scholar. Dorar and Sunnah.com were not reachable.
