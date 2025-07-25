from typing import Dict, Any
from fastapi import Request

# Message dictionary for multi-language support
MESSAGES: Dict[str, Dict[str, str]] = {
    # Workspace related messages
    "MAX_WORKSPACES": {
        "en": "You can create up to 3 workspaces only.",
        "tr": "En fazla 3 çalışma alanı oluşturabilirsiniz."
    },
    "WORKSPACE_CREATED": {
        "en": "Workspace created successfully.",
        "tr": "Çalışma alanı başarıyla oluşturuldu."
    },
    "WORKSPACE_NOT_FOUND": {
        "en": "Workspace not found.",
        "tr": "Çalışma alanı bulunamadı."
    },
    "WORKSPACE_ACCESS_DENIED": {
        "en": "Access denied to this workspace.",
        "tr": "Bu çalışma alanına erişim reddedildi."
    },
    "WORKSPACE_NAME_REQUIRED": {
        "en": "Workspace name is required.",
        "tr": "Çalışma alanı adı gereklidir."
    },
    "WORKSPACE_SLUG_EXISTS": {
        "en": "Workspace with this slug already exists.",
        "tr": "Bu slug ile çalışma alanı zaten mevcut."
    },
    
    # User related messages
    "USER_NOT_FOUND": {
        "en": "User not found.",
        "tr": "Kullanıcı bulunamadı."
    },
    "EMAIL_ALREADY_REGISTERED": {
        "en": "Email already registered.",
        "tr": "Bu email adresi zaten kayıtlı."
    },
    "INVALID_CREDENTIALS": {
        "en": "Incorrect email or password.",
        "tr": "Hatalı email veya şifre."
    },
    
    # General messages
    "ACCESS_DENIED": {
        "en": "Access denied.",
        "tr": "Erişim reddedildi."
    },
    "VALIDATION_ERROR": {
        "en": "Validation error.",
        "tr": "Doğrulama hatası."
    },
    "INTERNAL_SERVER_ERROR": {
        "en": "Internal server error.",
        "tr": "Sunucu hatası."
    },
    "NOT_FOUND": {
        "en": "Resource not found.",
        "tr": "Kaynak bulunamadı."
    }
}


def get_message(key: str, lang: str = "en") -> str:
    """Get localized message by key and language"""
    return MESSAGES.get(key, {}).get(lang, MESSAGES.get(key, {}).get("en", key))


def get_language_from_request(request: Request) -> str:
    """Extract language from Accept-Language header"""
    accept_language = request.headers.get("accept-language", "en")
    
    # Parse Accept-Language header (e.g., "tr-TR,tr;q=0.9,en;q=0.8")
    if accept_language:
        # Get the first language code
        primary_lang = accept_language.split(",")[0].split(";")[0].strip()
        # Extract base language (tr-TR -> tr)
        base_lang = primary_lang.split("-")[0].lower()
        
        # Check if we support this language
        if base_lang in ["tr", "en"]:
            return base_lang
    
    return "en"


def get_localized_message(key: str, request: Request) -> str:
    """Get localized message using request headers"""
    lang = get_language_from_request(request)
    return get_message(key, lang) 