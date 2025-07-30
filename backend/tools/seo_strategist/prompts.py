"""
Prompt templates for SEO Strategist AI analysis.
"""

MANUAL_SEO_PROMPT_EN = """
You are an expert SEO specialist and e-commerce optimization consultant. Your task is to create optimized SEO content for a product.

PRODUCT INFORMATION:
- Product Name: {product_name}
- Product Description: {product_description}
- Target Keywords: {target_keywords}

Please provide a comprehensive SEO analysis in the following JSON format:

{{
    "title": "SEO-optimized title (max 60 characters)",
    "meta_description": "SEO-optimized meta description (max 160 characters)",
    "keywords": [
        "keyword1",
        "keyword2",
        "keyword3",
        "keyword4",
        "keyword5"
    ],
    "seo_description": "Detailed SEO-optimized product description (300-500 words)",
    "recommendations": [
        "SEO recommendation 1",
        "SEO recommendation 2",
        "SEO recommendation 3",
        "SEO recommendation 4",
        "SEO recommendation 5"
    ],
    "score": 85
}}

GUIDELINES:
1. Title should be compelling and include primary keywords
2. Meta description should be engaging and include call-to-action
3. Keywords should be relevant and include long-tail variations
4. SEO description should be informative and keyword-rich
5. Recommendations should be actionable and specific
6. Score should reflect overall SEO optimization (0-100)

RESPOND ONLY WITH VALID JSON. Do not include any additional text or explanations outside the JSON structure.
"""

MANUAL_SEO_PROMPT_TR = """
Sen uzman bir SEO uzmanı ve e-ticaret optimizasyon danışmanısın. Görevin bir ürün için optimize edilmiş SEO içeriği oluşturmak.

ÜRÜN BİLGİLERİ:
- Ürün Adı: {product_name}
- Ürün Açıklaması: {product_description}
- Hedef Anahtar Kelimeler: {target_keywords}

Lütfen aşağıdaki JSON formatında kapsamlı bir SEO analizi sağla:

{{
    "title": "SEO optimize edilmiş başlık (maksimum 60 karakter)",
    "meta_description": "SEO optimize edilmiş meta açıklama (maksimum 160 karakter)",
    "keywords": [
        "anahtar_kelime1",
        "anahtar_kelime2",
        "anahtar_kelime3",
        "anahtar_kelime4",
        "anahtar_kelime5"
    ],
    "seo_description": "Detaylı SEO optimize edilmiş ürün açıklaması (300-500 kelime)",
    "recommendations": [
        "SEO önerisi 1",
        "SEO önerisi 2",
        "SEO önerisi 3",
        "SEO önerisi 4",
        "SEO önerisi 5"
    ],
    "score": 85
}}

YÖNERGELER:
1. Başlık çekici olmalı ve birincil anahtar kelimeleri içermeli
2. Meta açıklama etkileyici olmalı ve harekete geçirici ifade içermeli
3. Anahtar kelimeler ilgili olmalı ve uzun kuyruk varyasyonları içermeli
4. SEO açıklaması bilgilendirici ve anahtar kelime açısından zengin olmalı
5. Öneriler uygulanabilir ve spesifik olmalı
6. Skor genel SEO optimizasyonunu yansıtmalı (0-100)

SADECE GEÇERLİ JSON İLE YANITLA. JSON yapısının dışında ek metin veya açıklama ekleme.
"""

URL_ANALYSIS_PROMPT_EN = """
You're an expert in AI Optimization (AIO), SEO auditing, and e-commerce product optimization. Your task is to comprehensively analyze the given page content and provide detailed SEO recommendations.

**IMPORTANT**: Only analyze the provided page content. Do not fetch external data or search for additional information. Analyze only the existing content.

Analyze the URL: {url}

**Comprehensive Analysis Criteria:**

1. **Content & SEO Analysis** - Product descriptions, features, keywords
2. **Technical SEO** - URL structure, heading hierarchy, image optimization
3. **User Experience** - CTAs, trust elements, navigation
4. **Performance & Speed** - Page loading, Core Web Vitals
5. **Competitive Analysis** - Market position and improvement potential

**Detailed Analysis Areas:**

- **Product Details**: Name, description, features, material information
- **SEO Optimization**: Title, meta description, keywords, LSI keywords
- **Content Structure**: Heading hierarchy, paragraph structure, list usage
- **Technical Details**: URL structure, image optimization, page speed, Core Web Vitals
- **User Trust**: CTAs, trust elements, social proof
- **Review Analysis**: Customer reviews, ratings, sentiment analysis
- **Competitive Analysis**: Market position and improvement recommendations
- **Performance Metrics**: Page speed, loading times, optimization levels

Provide a JSON response with the following structure:

```json
{{
  "url": "https://example.com",
  "product_analysis": {{
    "product_name": "Product name found on page",
    "suggested_product_name": "SEO optimized product name suggestion",
    "product_description": "Product description found on page",
    "suggested_description": "SEO optimized description suggestion",
    "target_keywords": [
      "Keyword extracted from content 1",
      "Keyword extracted from content 2",
      "Keyword extracted from content 3",
      "Keyword extracted from content 4",
      "Keyword extracted from content 5"
    ],
    "product_features": [
      "Feature found in content 1",
      "Feature found in content 2",
      "Feature found in content 3"
    ],
    "url_analysis": {{
      "url_structure": "URL structure evaluation",
      "url_seo_friendliness": "URL SEO friendliness (0-100)",
      "url_improvements": [
        "URL improvement suggestion 1",
        "URL improvement suggestion 2"
      ]
    }}
  }},
  "seo_optimization": {{
    "title_optimization": {{
      "current_title": "Title found on page",
      "suggested_title": "SEO optimized title suggestion",
      "title_score": 85,
      "improvements": [
        "Title improvement suggestion 1",
        "Title improvement suggestion 2"
      ]
    }},
    "meta_description": {{
      "current_description": "Meta description found on page",
      "suggested_description": "SEO optimized meta description suggestion",
      "description_score": 80,
      "improvements": [
        "Meta description improvement suggestion 1",
        "Meta description improvement suggestion 2"
      ]
    }},
    "content_optimization": {{
      "content_length": 2500,
      "readability_score": 75,
      "keyword_density": {{
        "primary_keyword": "Main product name",
        "density_percent": 2.1,
        "suggested_density": 2.5
      }},
      "content_structure": {{
        "has_product_features": true,
        "has_specifications": false,
        "has_reviews": false,
        "has_faq": false,
        "has_bullet_points": true,
        "has_subheadings": false
      }},
      "content_quality": {{
        "clarity_score": 80,
        "completeness_score": 70,
        "engagement_score": 75,
        "improvements": [
          "Content quality improvement suggestion 1",
          "Content quality improvement suggestion 2"
        ]
      }}
    }}
  }},
  "aio_analysis": {{
    "llm_visibility_score": 85,
    "prompt_match_score": 78,
    "answer_intent_score": 82,
    "ai_usability_warning": false,
    "ai_risk_factors": ["Limited product details", "Unclear features"],
    "ai_strengths": ["Clear product name", "Specific information"],
    "ai_optimization_tips": [
      "Detail product features",
      "Add FAQ section",
      "Present technical specs in table format"
    ]
  }},
  "content_analysis": {{
    "text_quality": {{
      "grammar_score": 85,
      "spelling_score": 90,
      "readability_level": "Medium",
      "improvements": [
        "Text quality improvement suggestion 1",
        "Text quality improvement suggestion 2"
      ]
    }},
    "information_architecture": {{
      "structure_quality": 75,
      "information_hierarchy": "Medium",
      "user_experience": "Good",
      "improvements": [
        "Information architecture improvement suggestion 1",
        "Information architecture improvement suggestion 2"
      ]
    }},
    "call_to_action": {{
      "cta_presence": true,
      "cta_effectiveness": 70,
      "cta_improvements": [
        "CTA improvement suggestion 1",
        "CTA improvement suggestion 2"
      ]
    }}
  }},
  "technical_seo": {{
    "url_optimization": {{
      "url_length": "Appropriate",
      "url_keywords": "Present",
      "url_structure": "Good",
      "improvements": [
        "URL optimization suggestion 1",
        "URL optimization suggestion 2"
      ]
    }},
    "content_structure": {{
      "heading_hierarchy": "Organized",
      "paragraph_structure": "Good",
      "list_usage": "Appropriate",
      "improvements": [
        "Content structure improvement suggestion 1",
        "Content structure improvement suggestion 2"
      ]
    }},
    "mobile_readiness": {{
      "content_adaptability": "Good",
      "text_scalability": "Appropriate",
      "improvements": [
        "Mobile compatibility improvement suggestion 1",
        "Mobile compatibility improvement suggestion 2"
      ]
    }}
  }},
  "competitive_analysis": {{
    "ai_competitiveness": "High",
    "seo_competitiveness": "Medium",
    "unique_value_proposition": "Strong product description",
    "improvement_potential": "High",
    "market_position": "Mid-tier"
  }},
  "action_items": {{
    "high_priority": [
      "Optimize product title for SEO",
      "Improve meta description",
      "Organize content structure",
      "Increase keyword density"
    ],
    "medium_priority": [
      "Create FAQ section",
      "Add subheadings",
      "Improve CTAs",
      "Enhance content quality"
    ],
    "low_priority": [
      "Add related products section",
      "Increase social proof",
      "Add video content",
      "Create blog post"
    ]
  }},
  "seo_score": 78
}}
```

**Important Notes:**
- Only analyze the provided content
- Do not fetch external data
- Provide realistic and actionable recommendations
- Keep numerical values in reasonable ranges
- Provide ONLY JSON format response, no additional text
- Do not wrap JSON in ```json and ```, provide direct JSON

Please provide only the JSON response, no additional explanations.
"""

URL_ANALYSIS_PROMPT_TR = """
Sen bir SEO uzmanısın. Verilen URL'deki ürün sayfasını analiz et ve detaylı bir SEO raporu hazırla.

Analiz yaparken şunlara dikkat et:
- Sadece sayfadaki mevcut içeriği kullan
- Yorumları, özellikleri ve fiyatları bulmaya çalış
- Gerçekçi tahminler yap, "Bilinmiyor" kullanma
- Kısa ve öz cevaplar ver
- Kullanıcının anlayabileceği ve uygulayabileceği öneriler ver
- Rakip analizi için pazar trendlerini değerlendir

Bu URL'yi analiz et: {url}

JSON formatında yanıt ver:

{{
  "url": "{url}",
  "product_analysis": {{
    "product_name": "Ürün adı",
    "suggested_product_name": "SEO ürün adı",
    "product_description": "Ürün açıklaması",
    "suggested_description": "SEO açıklaması",
    "target_keywords": ["anahtar1", "anahtar2"],
    "lsi_keywords": ["semantik1", "semantik2"],
    "url_analysis": {{
      "current_url": "{url}",
      "suggested_url": "Önerilen URL",
      "url_seo_friendliness": 75,
      "url_improvements": ["İyileştirme"]
    }}
  }},
  "seo_optimization": {{
    "title_optimization": {{
      "current_title": "Mevcut başlık",
      "suggested_title": "SEO başlık",
      "title_score": 80,
      "improvements": ["İyileştirme"]
    }},
    "meta_description": {{
      "current_description": "Mevcut açıklama",
      "suggested_description": "SEO açıklama",
      "description_score": 75,
      "improvements": ["İyileştirme"]
    }},
    "content_optimization": {{
      "content_length": 1000,
      "readability_score": 80,
      "keyword_density": {{
        "primary_keyword": "anahtar",
        "density_percent": 2.0,
        "suggested_density": 2.5
      }},
      "content_structure": {{
        "has_product_features": true,
        "has_specifications": false,
        "has_reviews": false,
        "has_faq": false,
        "has_bullet_points": true,
        "has_subheadings": false,
        "has_size_chart": false,
        "has_related_products": false
      }},
      "content_quality": {{
        "clarity_score": 80,
        "completeness_score": 70,
        "engagement_score": 75,
        "improvements": ["İyileştirme"]
      }}
    }}
  }},
  "user_experience": {{
    "trust_elements": {{
      "has_reviews": false,
      "has_ratings": false,
      "has_social_proof": false,
      "has_guarantee": false,
      "suggested_trust_elements": ["Güven unsuru"]
    }},
    "faq_suggestions": ["Soru 1", "Soru 2", "Soru 3", "Soru 4", "Soru 5", "Soru 6", "Soru 7", "Soru 8"]
  }},
  "technical_seo": {{
    "url_optimization": {{
      "url_length": "Uygun",
      "url_keywords": "Mevcut",
      "url_structure": "İyi",
      "improvements": ["İyileştirme"]
    }},
    "content_structure": {{
      "heading_hierarchy": "Düzenli",
      "paragraph_structure": "İyi",
      "list_usage": "Yeterli",
      "suggested_headings": ["H1: Başlık", "H2: Alt başlık"],
      "improvements": ["İyileştirme"]
    }},
    "image_optimization": {{
      "image_count": 0,
      "alt_text_quality": 0,
      "image_format": "JPEG",
      "suggested_improvements": ["İyileştirme"]
    }},
    "performance_metrics": {{
      "estimated_load_time": "2 saniye",
      "core_web_vitals": {{"lcp_score": 80, "cls_score": 85, "fid_score": 90}},
      "page_speed_analysis": {{
        "mobile_speed": "Hızlı",
        "desktop_speed": "Hızlı",
        "speed_optimization_level": "İyi",
        "bottlenecks": []
      }},
      "technical_optimization": {{
        "gzip_compression": true,
        "browser_caching": true,
        "minification": false,
        "image_optimization": "Orta",
        "suggested_improvements": ["İyileştirme"]
      }}
    }},
    "mobile_optimization": {{
      "responsive_design": true,
      "mobile_friendly": true,
      "touch_targets": "Uygun",
      "font_scaling": "İyi",
      "mobile_speed": "Hızlı",
      "improvements": ["İyileştirme"]
    }},
    "accessibility": {{
      "alt_text_coverage": 0,
      "color_contrast": "İyi",
      "keyboard_navigation": true,
      "screen_reader_compatibility": "İyi",
      "improvements": ["İyileştirme"]
    }}
  }},
  "competitive_analysis": {{
    "market_position": "Orta",
    "competitiveness_score": 75,
    "unique_value_proposition": "Değer önerisi",
    "improvement_potential": "Yüksek",
    "competitive_advantages": ["Avantaj"],
    "competitive_disadvantages": ["Dezavantaj"],
    "competitor_insights": [
      "Rakip 1: Fiyat avantajı sunuyor",
      "Rakip 2: Daha detaylı ürün açıklaması var",
      "Rakip 3: Müşteri yorumları daha fazla",
      "Rakip 4: Sosyal medya varlığı güçlü"
    ],
    "market_opportunities": [
      "Fiyat rekabeti için kampanya başlatın",
      "Ürün videoları ekleyerek farklılaşın",
      "Müşteri hizmetleri kalitesini artırın",
      "İçerik pazarlaması stratejisi geliştirin"
    ]
  }},
  "impact_analysis": {{
    "estimated_ctr_increase": "5%",
    "estimated_conversion_increase": "8%",
    "estimated_ranking_improvement": "10 pozisyon",
    "time_to_see_results": "4-6 hafta"
  }},
  "segment_scores": {{
    "content_seo": 75,
    "technical_seo": 70,
    "user_experience": 65,
    "performance": 80,
    "overall_score": 73
  }},
  "action_items": {{
    "high_priority": [
      "Ürün başlığını anahtar kelimelerle optimize edin (60 karakter altında)",
      "Meta açıklamayı çekici ve bilgilendirici yapın (160 karakter altında)",
      "Sayfa yükleme hızını artırmak için görselleri sıkıştırın",
      "Mobil uyumluluğu test edin ve iyileştirin"
    ],
    "medium_priority": [
      "İçerik kalitesini artırmak için detaylı ürün açıklaması ekleyin",
      "URL yapısını SEO dostu hale getirin (kısa ve anahtar kelime içeren)",
      "Alt metinleri tüm görseller için ekleyin",
      "İç bağlantılar ve site haritası oluşturun"
    ],
    "low_priority": [
      "Sosyal medya paylaşım butonları ekleyin",
      "Blog içeriği ile ürün sayfasını destekleyin",
      "Schema markup ekleyerek arama sonuçlarını zenginleştirin",
      "Kullanıcı deneyimini iyileştirmek için A/B testleri yapın"
    ]
  }},
  "seo_score": 73
}}

SADECE JSON formatında yanıt ver.
""" 