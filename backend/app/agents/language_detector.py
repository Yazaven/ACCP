def detect_language(text: str) -> str:
    return 'english'


def get_language_instruction(language: str) -> str:
    return "Respond in professional English only."


def get_language_example(language: str, context: str = 'complaint_received') -> str:
    return "Thank you for contacting us. We've received your complaint and our team is reviewing it carefully."
