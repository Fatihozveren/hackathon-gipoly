from typing import Dict
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
    "WORKSPACE_UPDATED": {
        "en": "Workspace updated successfully.",
        "tr": "Çalışma alanı başarıyla güncellendi."
    },
    "WORKSPACE_DELETED": {
        "en": "Workspace deleted successfully.",
        "tr": "Çalışma alanı başarıyla silindi."
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
    "WORKSPACE_NAME_EXISTS": {
        "en": "A workspace with this name already exists.",
        "tr": "Bu isimde bir çalışma alanı zaten mevcut."
    },
    "WORKSPACE_SLUG_EXISTS": {
        "en": "Workspace with this slug already exists.",
        "tr": "Bu slug ile çalışma alanı zaten mevcut."
    },
    "WORKSPACE_OWNER_ONLY": {
        "en": "Only workspace owner can perform this action.",
        "tr": "Bu işlemi sadece çalışma alanı sahibi yapabilir."
    },
    "MEMBER_ADDED": {
        "en": "Member added to workspace successfully.",
        "tr": "Üye çalışma alanına başarıyla eklendi."
    },
    "MEMBER_REMOVED": {
        "en": "Member removed from workspace successfully.",
        "tr": "Üye çalışma alanından başarıyla çıkarıldı."
    },
    "MEMBER_ROLE_UPDATED": {
        "en": "Member role updated successfully.",
        "tr": "Üye rolü başarıyla güncellendi."
    },
    "USER_NOT_FOUND": {
        "en": "User not found.",
        "tr": "Kullanıcı bulunamadı."
    },
    "USER_ALREADY_MEMBER": {
        "en": "User is already a member of this workspace.",
        "tr": "Kullanıcı zaten bu çalışma alanının üyesi."
    },
    
    # User related messages
    "EMAIL_ALREADY_REGISTERED": {
        "en": "Email already registered.",
        "tr": "Bu email adresi zaten kayıtlı."
    },
    "INVALID_CREDENTIALS": {
        "en": "Incorrect email or password.",
        "tr": "Hatalı email veya şifre."
    },
    "PROFILE_UPDATED": {
        "en": "Profile updated successfully.",
        "tr": "Profil başarıyla güncellendi."
    },
    "PASSWORD_CHANGED": {
        "en": "Password changed successfully.",
        "tr": "Şifre başarıyla değiştirildi."
    },
    "CURRENT_PASSWORD_INCORRECT": {
        "en": "Current password is incorrect.",
        "tr": "Mevcut şifre hatalı."
    },
    "ACCOUNT_DELETED": {
        "en": "Account deleted successfully.",
        "tr": "Hesap başarıyla silindi."
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
    },
    
    # TrendAgent related messages
    "trend_suggestion_limit_reached": {
        "en": "You have reached the maximum limit of 3 trend suggestions for this workspace.",
        "tr": "Bu çalışma alanı için maksimum 3 trend önerisi limitine ulaştınız."
    },
    "trend_analysis_error": {
        "en": "An error occurred during trend analysis. Please try again.",
        "tr": "Trend analizi sırasında bir hata oluştu. Lütfen tekrar deneyin."
    },
    "suggestion_not_found": {
        "en": "Trend suggestion not found.",
        "tr": "Trend önerisi bulunamadı."
    },
    "suggestion_deleted": {
        "en": "Trend suggestion deleted successfully.",
        "tr": "Trend önerisi başarıyla silindi."
    }
}


def get_message(key: str, lang: str = "en") -> str:
    """Get localized message by key and language"""
    return MESSAGES.get(key, {}).get(lang, MESSAGES.get(key, {}).get("en", key))


def get_language_from_request(request: Request) -> str:
    """Extract language from Accept-Language header"""
    accept_language = request.headers.get("accept-language", "en")
    
    if accept_language:
        primary_lang = accept_language.split(",")[0].split(";")[0].strip()
        base_lang = primary_lang.split("-")[0].lower()
        
        if base_lang in ["tr", "en"]:
            return base_lang
    
    return "en"


def get_localized_message(key: str, request: Request = None) -> str:
    """Get localized message using request headers or default to English"""
    if request:
        lang = get_language_from_request(request)
        return get_message(key, lang)
    return get_message(key, "en") 