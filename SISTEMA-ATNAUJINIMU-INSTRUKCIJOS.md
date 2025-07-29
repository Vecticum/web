# Sistemos atnaujinimų instrukcijos

## Kaip pridėti nuotraukas prie funkcionalumų ar patobulinimų

Dabar galite pridėti nuotraukas prie bet kurio funkcionalumo ar patobulinimu punkto dviem būdais:

### 1. Paprastas tekstas (be nuotraukos)
```yaml
features:
  - "Paprastas funkcionalumas be nuotraukos"
```

### 2. Tekstas su nuotrauka
```yaml
features:
  - text: "Funkcionalumas su nuotrauka"
    image: "/media/services/pavyzdys.png"
    imageAlt: "Alternatyvus tekstas nuotraukai"
```

## Kaip pridėti nuorodas tekste

Galite naudoti HTML nuorodas bet kuriame tekste:

### Nuoroda be nuotraukos
```yaml
features:
  - "Patobulinta funkcija. Daugiau informacijos: <a href='https://vecticum.lt/puslapis' target='_blank' class='text-blue-600 hover:text-blue-800 underline'>nuorodos tekstas</a>"
```

### Nuoroda su nuotrauka
```yaml
features:
  - text: "Funkcionalumas su nuoroda ir nuotrauka. Skaitykite daugiau: <a href='https://vecticum.lt/puslapis' target='_blank' class='text-blue-600 hover:text-blue-800 underline'>čia</a>"
    image: "/media/services/pavyzdys.png"
    imageAlt: "Alternatyvus tekstas"
```

## Nuorodos styling

Nuorodų CSS klasės:
- `text-blue-600` - mėlyna spalva
- `hover:text-blue-800` - tamsesnė mėlyna spalva hover būsenoje
- `underline` - pabraukimas
- `target='_blank'` - atidarys naujame tab'e

## Pilnas pavyzdys

```yaml
---
version: "Vecticum sistemos 2024 rugsėjo mėn. naujienos"
releaseDate: "2024-09-25"
features:
  - text: "Nauja darbuotojų duomenų bazės valdymo sistema"
    image: "/media/services/darbuotoju-duomenu-bazes-hero.png"
    imageAlt: "Darbuotojų duomenų bazės valdymo sistema"
  - "Paprastas funkcionalumas be nuotraukos"
  - "Patobulinta savitarna. Daugiau informacijos: <a href='https://vecticum.lt/darbuotoju-idarbinimo-savitarna/' target='_blank' class='text-blue-600 hover:text-blue-800 underline'>Darbuotojų įdarbinimo savitarna</a>"
  - text: "Darbo sutarčių automatinis generavimas su nuoroda"
    image: "/media/services/darbo-sutarciu-hero.png"  
    imageAlt: "Darbo sutarčių valdymo sistema"
improvements:
  - text: "Pagreitintas duomenų įkėlimas iki 50%"
    image: "/media/services/greitis.png"
    imageAlt: "Sistemos greičio patobulinimas"
  - "Patobulinta vartotojo sąsaja su <a href='https://vecticum.lt/kontaktai' target='_blank' class='text-blue-600 hover:text-blue-800 underline'>palaikymo komanda</a>"
---
```

## Nuotraukų talpinimo vietos

Nuotraukas reikia talpinti į `public/media/` direktoriją arba jos poaplankius:
- `/media/services/` - paslaugų nuotraukos
- `/media/blog/` - blog'o nuotraukos  
- `/media/icons/` - piktogramos

## Rekomenduojami nuotraukų formatai

- **Dydis**: maksimalus plotis 800px
- **Formatai**: .png, .jpg, .webp
- **Failo dydis**: iki 500KB
- **Proporcijos**: 16:9 arba 4:3 optimalios

## Kaip nuotraukos ir nuorodos rodomos

- Nuotraukos rodomos po kiekvieno punkto teksto centre
- Automatiškai pritaikomos responsive dizainui
- Maksimalus plotis: 500px
- Automatiškai apvalinti kampai ir šešėlis
- Nuorodos turi mėlyną spalvą ir hover efektą
