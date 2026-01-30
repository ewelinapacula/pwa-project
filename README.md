# Field Notes PWA

Aplikacja typu **PWA (Progressive Web App)** do tworzenia notatek. Notatki są zapisywane lokalnie w przeglądarce (**localStorage**) i mogą zawierać:
- tytuł i opis,
- lokalizację (geolokalizacja),
- zdjęcie z kamery.

Projekt wykonany w technologiach: **HTML, CSS, JavaScript**.

---

## Demo (hosting)
Aplikacja jest postawiona na hostingu z HTTPS (Netlify):  
https://pwa-projekt.netlify.app/

---

## Technologie
- HTML
- CSS
- JavaScript
- Web App Manifest (instalowalność)
- Service Worker + Cache API (działanie offline)
- localStorage (persistencja danych)

---

## Funkcjonalności
- Dodawanie notatek (tytuł, opis)
- Usuwanie pojedynczej notatki
- Czyszczenie wszystkich danych
- Pobieranie lokalizacji urządzenia (geolokalizacja)
- Robienie zdjęcia z kamery i zapis do notatki
- Działanie offline + informacja o braku internetu (baner)

---

## Widoki / Flow aplikacji (min. 3 widoki)
Aplikacja posiada 3 logiczne widoki oraz spójny flow użytkownika:

1. **Home** – lista notatek + usuwanie notatek + czyszczenie danych  
2. **Dodaj** – formularz dodania notatki + geolokalizacja + kamera  
3. **O aplikacji** – opis działania i spełnionych kryteriów  

Nawigacja jest zrealizowana przez **hash routing**:  
`#/home`, `#/add`, `#/about`

---

## Instalowalność (PWA)
Aplikacja jest instalowalna dzięki plikowi **manifest.webmanifest**, który zawiera m.in.:
- `name`, `short_name`
- `start_url`, `scope`
- `display` (tryb standalone)
- `theme_color`, `background_color`
- ikony aplikacji (192 i 512)

### Jak zainstalować
- **Desktop (Chrome/Edge):** ikona instalacji w pasku adresu → Install  
- **Android:** „Dodaj do ekranu głównego”  
- **iOS (Safari):** Udostępnij → Add to Home Screen  

---

## Wykorzystane natywne funkcje urządzenia (min. 2)
W projekcie wykorzystano 2 natywne funkcje urządzenia:

### 1) Geolokalizacja
- API: `navigator.geolocation.getCurrentPosition`
- Działanie:
  - po kliknięciu „Pobierz lokalizację” aplikacja pobiera współrzędne (`latitude`, `longitude`)
  - wyświetla je w UI i zapisuje do obiektu notatki
- Obsługa błędów:
  - jeśli użytkownik nie wyrazi zgody lub wystąpi błąd, aplikacja pokazuje komunikat w UI

### 2) Kamera
- API: `navigator.mediaDevices.getUserMedia({ video: true })`
- Działanie:
  - „Uruchom kamerę” włącza podgląd wideo
  - „Zrób zdjęcie” zapisuje aktualną klatkę do `canvas`
  - zdjęcie jest eksportowane jako `DataURL` i zapisywane w notatce
- Zatrzymanie kamery:
  - przycisk „Zatrzymaj kamerę” zatrzymuje wszystkie tracki streamu (`stream.getTracks().forEach(t => t.stop())`)

---

## Działanie offline (Service Worker + Cache API)
Aplikacja działa w trybie offline dzięki **Service Worker** (`sw.js`) oraz **Cache API**:
- kluczowe pliki są buforowane (precache),
- użytkownik dostaje informację o braku internetu (baner),
- dostępna jest strona `offline.html` jako fallback, gdy brakuje zasobu i internetu.

---

## Strategia buforowania (caching)
Zastosowano strategię dopasowaną do rodzaju zasobów:

1. **Precache (install)**  
   Do cache trafiają podstawowe pliki aplikacji (np. `index.html`, `styles.css`, `app.js`, `manifest`, `offline.html`, ikony).

2. **Navigation / HTML – network-first**  
   - jeśli jest internet → pobierana jest świeża wersja strony i zapisywana do cache,
   - jeśli nie ma internetu → aplikacja zwraca wersję z cache (`index.html`), a w razie potrzeby fallback `offline.html`.

3. **Assety (CSS/JS/ikony) – cache-first + runtime caching**  
   - jeśli plik jest w cache → zwracany natychmiast (szybkie ładowanie),
   - jeśli nie ma → pobierany z sieci i dopisywany do cache.

---

## Wydajność (Lighthouse)
Aplikacja może być oceniona w Chrome DevTools:
1. Otwórz DevTools → zakładka **Lighthouse**
2. Uruchom audit dla kategorii: Performance / PWA / Best Practices


Raport Lighthouse (HTML):
[Otwórz raport](reports/lighthouse-report.html)

---

## Uruchomienie lokalne
> Service Worker działa tylko na **HTTPS** lub na **localhost** (nie z `file://`).

### Opcja 1: "`serve`
```bash
npx serve "

### Opcja 2: "`http-server`
```bash
npx http-server"

Wejdź w przeglądarce na adres podany w konsoli (np. `http://localhost:3000` albo `http://localhost:8080`).

---

## Struktura projektu
Przykładowa struktura plików:

- `index.html` – widoki + layout aplikacji
- `styles.css` – responsywny wygląd
- `app.js` – routing, logika notatek, geolokalizacja, kamera, rejestracja SW
- `sw.js` – cache + obsługa offline
- `offline.html` – fallback offline
- `manifest.webmanifest` – metadane PWA
- `icons/` – ikony 192 i 512

---

## Przechowywanie danych
Notatki są przechowywane lokalnie w przeglądarce:
- `localStorage` pod kluczem: `pwa_notes_v1`

Przykładowa struktura notatki:
- `id` (unikalne)
- `title`
- `text`
- `createdAt`
- `geo` / `geoText`
- `photoDataUrl`

---

## Autor
Uzupełnij: Ewelina Pacuła


