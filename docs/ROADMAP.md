# Roadmapa

Ten dokument opisuje uczciwie, co w NovaWorlds dziala w pelni juz teraz, a co jest swiadomie
uproszczone lub odlozone na potem - zgodnie z ustaleniem, ze ta platforma to solidny,
DZIALAJACY szkielet do dalszej rozbudowy, a nie w pelni wykonczony produkt (co dla projektu
tej skali - pelny odpowiednik Roblox - realistycznie wymagaloby pracy zespolu inzynierow
przez wiele miesiecy).

## Dziala w pelni

- Rejestracja/logowanie (JWT), profile graczy, role (player/moderator/admin).
- Katalog gier, publikowanie gier z edytora, licznik rozegranych.
- Multiplayer real-time (Colyseus) z autorytatywna fizyka (cannon-es).
- Dwie w pelni grywalne gry: **Obby** (parkour z checkpointami) i **Shooter FPS** (drużynowa
  strzelanka z botami AI - patrolowanie, pościg, walka, ucieczka przy niskim zdrowiu).
- Boty AI: maszyna stanow (patrol/chase/attack/collect/flee), pathfinding A*, unikanie przeszkod.
- NPC z prawdziwym dialogiem LLM (Claude) + pamiecia per-gracz w bazie + system questow.
- Czat globalny (Socket.IO) + czat w grze (Colyseus broadcast).
- Znajomi, zaproszenia, grupy.
- Edytor NovaStudio: drzewo sceny, viewport z gizmo (translate/rotate/scale), inspektor,
  edytor skryptow, import modeli GLTF, lokalny test-play z prawdziwa fizyka, publikowanie.
- Sklep, ekwipunek, waluta (monety), osiagniecia, ranking (globalny XP + per-gra).
- Panel administratora (zarzadzanie kontami/rolami/banami, przeglad gier) i panel moderatora
  (kolejka zgloszen).
- Przechowywanie plikow (upload lokalny na dysk, latwo podmienialny na S3).
- Dokumentacja API generowana automatycznie (Swagger, `/api/docs`).
- Docker Compose uruchamiajacy cala platforme jedna komenda.

## Swiadome uproszczenia (i jak je rozszerzyc)

- **7 z 9 gier** (Survival, Tycoon, Hide and Seek, Racing, Sandbox, RPG, Simulator) sa
  zarejestrowane w katalogu jako prototypy z pusta scena - kazda ma wlasny plik
  `games/<nazwa>/README.md` z konkretnym planem dokonczenia (poziom w NovaStudio + nowa
  klasa `Room` w `game-server`, ktora w wiekszosci opiera sie na juz gotowym `BaseGameRoom`).
- **Brak predykcji klienta / reconciliation**: ruch gracza jest w pelni autorytatywny po
  stronie serwera - klient renderuje bezposrednio stan z serwera (z prostym `lerp` dla
  plynnosci). Dla bardzo szybkich gier (np. Shooter) doda to zauwazalne opoznienie ruchu przy
  wysokim pingu; naturalny kolejny krok to client-side prediction + server reconciliation.
- **Brak raycastu przeciw geometrii poziomu przy strzale (hitscan)** - trafienie w Shooterze
  sprawdza tylko odleglosc + kat wzgledem przeciwnikow, bez sprawdzania czy strzal jest
  zablokowany przez ściane lub oslone. Kolejny krok: raycast `PhysicsWorld` przed
  zaaplikowaniem obrazen.
- **TypeORM `synchronize: true`** - wygodne w dev/demo, ale w produkcji nalezy przejsc na
  prawdziwe migracje (`typeorm migration:generate`).
- **Transformacje zagniezdzone w scenie sa plaskie** - `flattenNodes`/`flattenSceneNodes`
  traktuja pozycje kazdego wezla jako globalna, bez kompozycji z rodzicem. Wystarczajace dla
  obecnych, plaskich poziomow generowanych programowo; pelna hierarchia transformacji
  (potrzebna np. do ruchomych platform z dzieckmi) to naturalne rozszerzenie
  `SceneBuilder`/`BaseGameRoom`.
- **Model dla ekwipunku w Avatar Editorze** - kolory ciala/glowy dzialaja w pelni, ale
  zalozone przedmioty (czapki, akcesoria) sa dziś tylko wpisem w ekwipunku bez wlasnej
  geometrii 3D doczepionej do awatara - potrzeba biblioteki modeli GLTF per przedmiot.
- **Brak realnych migracji bazodanowych, testow e2e i CI/CD** - swiadomie poza zakresem tego
  szkieletu; polecany kolejny krok to dodanie `apps/backend`'owych testow (Jest, juz
  skonfigurowany przez Nest CLI) i pipeline'u (GitHub Actions) budujacego wszystkie
  workspace'y i obrazy Dockera.

## Sugerowana kolejnosc dalszej pracy

1. Dokonczyc Racing (najwiecej wspoldzieli z Obby - patrz `games/racing/README.md`).
2. Dodac client-side prediction do `GameCanvas`/`BaseGameRoom` dla lepszego odczucia w Shooterze.
3. Dokonczyc RPG (backend/AI juz gotowe, brakuje tylko poziomu i `RpgRoom`).
4. Migracje bazodanowe + testy e2e + CI.
