"""
Prompts for AdCreative tool.
"""

AD_CREATIVE_PROMPT_EN = """
You are an expert advertising copywriter and marketing strategist. Create a comprehensive advertising campaign for the following product:

Product Name: {product_name}
Product Description: {product_description}
Platform: {platform}
Campaign Goal: {goal}
Target Audience: {audience_age} years old, interested in {audience_interests}

Generate a complete advertising package including:

1. Headlines (short and long versions)
2. 3-4 advertising text variations with different tones and approaches
3. 4-5 compelling CTAs for different stages of the customer journey
4. Keywords and hashtags with trend indicators
5. Detailed performance estimation
6. 5 actionable insights with step-by-step guidance
7. Platform-specific optimization tips
8. A/B testing suggestions
9. Budget allocation recommendations
10. Campaign timeline suggestions

Respond in JSON format:
{{
    "headlines": {{
        "short": "Short headline under 40 characters",
        "long": "Long headline under 90 characters"
    }},
    "ad_texts": [
        "First ad text variation with engaging tone",
        "Second ad text variation with different approach", 
        "Third ad text variation with emotional appeal",
        "Fourth ad text variation with urgency/scarcity"
    ],
    "ctas": [
        "Shop Now",
        "Learn More", 
        "Get Started",
        "Discover Today",
        "Limited Time Offer"
    ],
    "keywords": [
        {{"keyword": "keyword1", "trend_level": "🔥", "search_volume": "High"}},
        {{"keyword": "keyword2", "trend_level": "⭐", "search_volume": "Medium"}},
        {{"keyword": "keyword3", "trend_level": "📉", "search_volume": "Low"}},
        {{"keyword": "keyword4", "trend_level": "🔥", "search_volume": "High"}},
        {{"keyword": "keyword5", "trend_level": "⭐", "search_volume": "Medium"}}
    ],
    "performance": {{
        "ctr_estimate": "2.5%",
        "ad_score": 85,
        "conversion_potential": "High",
        "estimated_reach": "10K-50K",
        "cost_per_click": "$0.50-$1.20",
        "roas_potential": "3.5x-5x"
    }},
    "insights": [
        "First actionable insight with specific steps",
        "Second actionable insight with implementation guide",
        "Third actionable insight with best practices",
        "Fourth actionable insight with optimization tips",
        "Fifth actionable insight with measurement strategy"
    ],
    "platform_tips": [
        "Platform-specific optimization tip 1",
        "Platform-specific optimization tip 2",
        "Platform-specific optimization tip 3"
    ],
    "ab_testing": [
        "A/B test suggestion 1 with metrics to track",
        "A/B test suggestion 2 with success criteria",
        "A/B test suggestion 3 with implementation steps"
    ],
    "budget_recommendations": {{
        "daily_budget": "$50-$200",
        "campaign_duration": "14-30 days",
        "budget_allocation": "60% for top performers, 30% for testing, 10% for new creatives"
    }},
    "campaign_timeline": [
        "Week 1: Launch and monitor performance",
        "Week 2: Optimize based on data",
        "Week 3: Scale successful ads",
        "Week 4: Analyze results and plan next campaign"
    ],
    "next_steps": [
        "Immediate action item 1",
        "Immediate action item 2", 
        "Immediate action item 3"
    ]
}}

Make sure the content is engaging, platform-appropriate, and optimized for the target audience. Provide specific, actionable advice that users can implement immediately.
"""

AD_CREATIVE_PROMPT_TR = """
Sen deneyimli bir reklam metin yazarı ve pazarlama stratejistisin. Aşağıdaki ürün için kapsamlı bir reklam kampanyası oluştur:

Ürün Adı: {product_name}
Ürün Açıklaması: {product_description}
Platform: {platform}
Kampanya Hedefi: {goal}
Hedef Kitle: {audience_age} yaşında, {audience_interests} ile ilgilenen

Kapsamlı bir reklam paketi oluştur:

1. Başlıklar (kısa ve uzun versiyonlar)
2. Farklı tonlarda 3-4 reklam metni varyasyonu
3. Müşteri yolculuğunun farklı aşamaları için 4-5 etkileyici CTA
4. Trend göstergeleri ile anahtar kelimeler ve hashtag'ler
5. Detaylı performans tahmini
6. Adım adım rehberlik ile 5 uygulanabilir içgörü
7. Platform özelinde optimizasyon ipuçları
8. A/B test önerileri
9. Bütçe tahsisi önerileri
10. Kampanya zaman çizelgesi önerileri

JSON formatında yanıt ver:
{{
    "headlines": {{
        "short": "40 karakter altında kısa başlık",
        "long": "90 karakter altında uzun başlık"
    }},
    "ad_texts": [
        "İlk reklam metni varyasyonu - etkileyici ton",
        "İkinci reklam metni varyasyonu - farklı yaklaşım",
        "Üçüncü reklam metni varyasyonu - duygusal çekicilik",
        "Dördüncü reklam metni varyasyonu - aciliyet/azlık"
    ],
    "ctas": [
        "Şimdi Al",
        "Daha Fazla Bilgi",
        "Hemen Başla",
        "Bugün Keşfet",
        "Sınırlı Süre Teklifi"
    ],
    "keywords": [
        {{"keyword": "anahtar1", "trend_level": "🔥", "search_volume": "Yüksek"}},
        {{"keyword": "anahtar2", "trend_level": "⭐", "search_volume": "Orta"}},
        {{"keyword": "anahtar3", "trend_level": "📉", "search_volume": "Düşük"}},
        {{"keyword": "anahtar4", "trend_level": "🔥", "search_volume": "Yüksek"}},
        {{"keyword": "anahtar5", "trend_level": "⭐", "search_volume": "Orta"}}
    ],
    "performance": {{
        "ctr_estimate": "%2.5",
        "ad_score": 85,
        "conversion_potential": "Yüksek",
        "estimated_reach": "10K-50K",
        "cost_per_click": "$0.50-$1.20",
        "roas_potential": "3.5x-5x"
    }},
    "insights": [
        "İlk uygulanabilir içgörü - spesifik adımlarla",
        "İkinci uygulanabilir içgörü - uygulama rehberi ile",
        "Üçüncü uygulanabilir içgörü - en iyi uygulamalar",
        "Dördüncü uygulanabilir içgörü - optimizasyon ipuçları",
        "Beşinci uygulanabilir içgörü - ölçüm stratejisi"
    ],
    "platform_tips": [
        "Platform özelinde optimizasyon ipucu 1",
        "Platform özelinde optimizasyon ipucu 2",
        "Platform özelinde optimizasyon ipucu 3"
    ],
    "ab_testing": [
        "A/B test önerisi 1 - takip edilecek metriklerle",
        "A/B test önerisi 2 - başarı kriterleriyle",
        "A/B test önerisi 3 - uygulama adımlarıyla"
    ],
    "budget_recommendations": {{
        "daily_budget": "$50-$200",
        "campaign_duration": "14-30 gün",
        "budget_allocation": "En iyi performans gösterenler için %60, test için %30, yeni yaratıcılar için %10"
    }},
    "campaign_timeline": [
        "1. Hafta: Başlat ve performansı izle",
        "2. Hafta: Verilere göre optimize et",
        "3. Hafta: Başarılı reklamları ölçeklendir",
        "4. Hafta: Sonuçları analiz et ve sonraki kampanyayı planla"
    ],
    "next_steps": [
        "Acil eylem maddesi 1",
        "Acil eylem maddesi 2",
        "Acil eylem maddesi 3"
    ]
}}

İçeriğin etkileyici, platforma uygun ve hedef kitle için optimize edilmiş olduğundan emin ol. Kullanıcıların hemen uygulayabileceği spesifik, eyleme dönüştürülebilir tavsiyeler ver.
"""

IMAGE_GENERATION_PROMPT_EN = """
Create a professional advertising image for the following product:

PRODUCT: {product_name}
DESCRIPTION: {product_description}
PLATFORM: {platform}
TARGET AUDIENCE: {audience_age} years old, interested in {audience_interests}

IMPORTANT: Show ONLY the specified product. Do not show wrong products.

REQUIREMENTS:
1. MAIN PRODUCT: {product_name} - This product must be clear and prominent in the image
2. PRODUCT COLOR: Maintain the product's actual color
3. COMPOSITION: Product should be the central element, background should be minimal
4. STYLE: Professional product photography, studio lighting
5. BACKGROUND: Clean, white or gradient background
6. ANGLE: Best angle to show the product (45 degrees or front view)
7. RESOLUTION: High quality, sharp image

FORBIDDEN ELEMENTS:
- Showing wrong products
- Adding products other than the specified one
- Complex backgrounds
- Too much text or logos

TECHNICAL DETAILS:
- Product: {product_name}
- Color: Product's natural color
- Lighting: Professional studio lighting
- Background: Clean, minimal
- Focus: Product clear and prominent

This is a {product_name} advertisement. Show ONLY this product.
"""

IMAGE_GENERATION_PROMPT_TR = """
Aşağıdaki ürün için profesyonel bir reklam görseli oluştur:

ÜRÜN: {product_name}
ÜRÜN AÇIKLAMASI: {product_description}
PLATFORM: {platform}
HEDEF KİTLE: {audience_age} yaşında, {audience_interests} ile ilgilenen

ÖNEMLİ: Sadece belirtilen ürünü göster. Yanlış ürün gösterme.

GEREKSİNİMLER:
1. ANA ÜRÜN: {product_name} - Bu ürün görselde net ve belirgin olmalı
2. ÜRÜN RENGİ: Ürünün gerçek rengini koru
3. KOMPOZİSYON: Ürün merkezi öğe olmalı, arka plan minimal olmalı
4. STİL: Profesyonel ürün fotoğrafçılığı, stüdyo aydınlatması
5. ARKA PLAN: Temiz, beyaz veya gradient arka plan
6. AÇI: Ürünü en iyi gösteren açı (45 derece veya önden)
7. ÇÖZÜNÜRLÜK: Yüksek kalite, net görüntü

YASAKLANAN ÖĞELER:
- Yanlış ürün gösterme
- Belirtilen ürün dışında başka ürünler ekleme
- Karmaşık arka planlar
- Çok fazla metin veya logo

TEKNİK DETAYLAR:
- Ürün: {product_name}
- Renk: Ürünün doğal rengi
- Aydınlatma: Profesyonel stüdyo aydınlatması
- Arka plan: Temiz, minimal
- Odak: Ürün net ve belirgin

Bu bir {product_name} reklamıdır. Sadece bu ürünü göster.
""" 