# Hubmonity - Backend
Część serwerowa aplikacji Hubmonity.

# Plik konfiguracyjny .env
Wymagana struktura pliku .env:

| Zmienna | Opis |
| ------------- | ------------- |
| DATABASE_URL | Adres url do bazy danych |
| TOKEN_SECRET | Klucz tajny do podpisywania tokena JWT |
| TOKEN_EXPIRE | Czas życia tokena JWT (np '5m') |
| TOKEN_REFRESH_SECRET | Klucz tajny do podpisy tokena odświeżającego |
| TOKEN_REFRESH_EXPIRE | Czas życia tkoena odświeżającego (np '30d') |
| FILES_STORAGE_PATH | Ścieżka do zapisu plików użytkowników (np '/uploads/files') |
| AVATARS_STORAGE_PATH | Ścieżka do zapisu avatarów użytkowników (np '/uploads/avatars') |
| PAGINATION_ELEMENTS_PER_PAGE | Ilość elementów wyświetlanych na każdą stronę (np 50) |