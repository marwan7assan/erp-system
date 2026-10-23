# ERP System

واجهة ERP مبنية باستخدام React 19 وVite 7، مع دعم اللغتين الإنجليزية والعربية واتجاه RTL.
تحتوي الصفحات الحالية على بيانات تجريبية (mock data) إلى أن يتم ربط backend الإنتاجي.

## التشغيل

```bash
npm i
npm run dev       # واجهة Vite للتطوير
npm run server    # خادم المصادقة المؤقت للتطوير (نافذة منفصلة)
npm run build     # إنشاء نسخة الإنتاج
```

## هيكل المشروع

- `src/pages/` صفحات المصادقة ولوحة ERP.
- `src/components/` المكونات المشتركة والتخطيط.
- `src/locales/` ترجمات en/ar.
- `src/hooks/` منطق CRUD المشترك.
- `src/data/` البيانات التجريبية.
- `server.mjs` خادم مصادقة مؤقت للتطوير فقط، وليس backend إنتاجيًا.

## ربط الـ backend لاحقًا

انسخ `.env.example` إلى `.env` ثم غيّر `VITE_USE_API=true` و`VITE_API_BASE_URL` إلى عنوان API الخاص بالـ backend. صفحات CRUD تستخدم `useCrud` ومصادر API الموجودة في `src/services/api.js`، لذلك يقتصر الربط عادةً على مطابقة أسماء endpoints وشكل الاستجابة (`items` أو `data`)، بدون تعديل منطق الصفحات.

## التحقق

```bash
npm run lint
npm run build
```

قبل ضغط المشروع أو تسليمه، استبعد `node_modules/` و`dist/` و`data/users.json` من الملف المضغوط.
