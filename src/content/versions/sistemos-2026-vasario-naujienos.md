---
version: "Versija 2026.02"
releaseDate: "2026-02-28"
features:
  - 'Įdiegtas patobulinimas testavimo modulyje – po testo užbaigimo vartotojui pateikiamas „Uždaryti" mygtukas, leidžiantis aiškiai ir patogiai išeiti iš testo peržiūros lango, nepaliekant vartotojo „įstrigusio" rezultate.'
  - 'Išplėsta validacijos logika komandiruočių formoje – sistema dabar tikrina darbuotojo kalendorių ir, esant persidengiantiems įrašams (pvz., atostogoms ar kitoms nebuvimo rūšims), rodo aiškų klaidos pranešimą su konkrečiais konflikto intervalais ir įrašų tipais. Tai leidžia iš karto matyti, kurios datos užimtos ir dėl ko komandiruotė negali būti patvirtinta.'
  - 'Patobulintas PDF dokumentų atvaizdavimas ir paieškos veikimas mobiliuosiuose įrenginiuose – PDF failai dabar generuojami tvarkingai, nebelieka turinio išsikraipymų ar neteisingo išsidėstymo. Taip pat paieškos filtrai mobiliuosiuose įrenginiuose veikia iš karto įvedus kriterijus (pvz., vardą, pavardę ar telefono numerį), nebereikia papildomai spausti „Enter" ar pildyti kitų laukų.'
  - 'Optimizuotas prekių pasirinkimo sąrašo veikimas – nebekraunamas pakartotinai, jei jau buvo užkrautas anksčiau, ir aktyvuojamas tik pradėjus redaguoti eilutę. Dėl to ženkliai sumažėjo uždelsimai ir nebeliko naršyklės strigimų renkantis prekes.'
  - 'Pakoreguota metinių apyvartų pranešimų logika – pranešimai nebeformuojami kasdien po termino, o generuojami tik vieną kartą pagal nustatytą periodiškumą (mėnesiniai – kartą per mėnesį, metiniai – kartą per metus). Taip pat užtikrinta, kad būtų atsižvelgiama į nurodytą terminą ir nebūtų kuriami pertekliniai įrašai.'
improvements:
  - 'Ištaisytas datos pasirinkimo (datepicker) atvaizdavimo netolygumas – skirtinguose datos laukuose kalendoriaus langas nuo šiol rodomas nuosekliai ir vienodoje pozicijoje, užtikrinant patogesnį ir vieningą naudojimą.'
  - 'Pakoreguotas susipažinimo statuso perskaičiavimo scenarijus. Darbuotojui jau susipažinus su dokumentu, statusas nebus neteisingai pakeičiamas iš „completed" į „required", taip išlaikant teisingą susipažinimo būseną sistemoje.'
  - 'Pakeistas sutarčių failų atvaizdavimas – sutvarkytos problemos, kai failai (ypač su ilgesniais pavadinimais) išsikraipydavo ar netvarkingai išsidėstydavo, taip pat pakoreguotas versijų lango vaizdavimas, kad failus būtų patogiau peržiūrėti ir valdyti.'
  - 'Ištaisytas sąskaitų siuntimo dubliavimas – sutvarkytos situacijos, kai tas pats dokumentas būdavo išsiunčiamas kelis kartus, įdiegus papildomą tikrinimą, kuris neleidžia pakartotinai inicijuoti to paties siuntimo.'
  - 'Sutvarkytas testų skaičiavimo formos veikimas – užtikrinta, kad darbuotojo testo trukmė būtų korektiškai apskaičiuojama, išsaugoma ir rodoma sąrašuose, pašalinant atvejus, kai reikšmė neatsirasdavo dėl nesuveikiančių skaičiavimo išraiškų ar neišsaugotų duomenų. Papildomai pašalintas perteklinis „trukmė dienomis" laukas, kuris galėjo klaidinti vartotojus.'
  - 'Ištaisytas užduočių rikiavimas – sutvarkyta klaida, kai užduotys, sukurtos tą pačią dieną, būdavo rodomos atsitiktine tvarka, neatsižvelgiant į tikslų sukūrimo laiką; dabar rikiavimas vyksta pagal pilną datą ir laiką, todėl užduotys atvaizduojamos nuosekliai pagal pasirinktą rikiavimo logiką.'
  - 'Patobulintas „search keys" filtravimas pagal klases – kai atributui buvo nurodytos kelios klasės, sistema anksčiau rodydavo įrašus ir iš nepasirinktų klasių; dabar rezultatai filtruojami tik pagal tas klases, kurios apibrėžtos nustatymuose, todėl pasirinkimo sąraše neberodomi nereikalingi duomenys.'

---

