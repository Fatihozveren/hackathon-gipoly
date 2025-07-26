"""
Utility functions for TrendAgent analysis.
"""


def format_currency_range(price_range: str, country: str) -> str:
    """
    Format price range based on target country.
    """
    currency_symbols = {
        "United States": "$",
        "United Kingdom": "£",
        "Germany": "€",
        "France": "€",
        "Canada": "C$",
        "Australia": "A$",
        "Japan": "¥",
        "South Korea": "₩",
        "Turkey": "₺",
        "Brazil": "R$"
    }
    
    symbol = currency_symbols.get(country, "$")
    
    # If price range already has a symbol, return as is
    if any(s in price_range for s in ["$", "£", "€", "¥", "₩", "₺", "R$"]):
        return price_range
    
    # Add currency symbol
    return f"{symbol}{price_range}" 