# Boverket API Documentation

## Document 1: Publikt API för energideklarationer (Energy Declarations API)

Publikt API för energi-
         deklarationer
        Urvalslogik och resultat
Publikt API för energi-
deklarationer
Urvalslogik och resultat

           Innehåll
           Sammanfattning ............................................................................ 5
           Inledning och läsanvisningar ......................................................... 6
           Urvalslogik .................................................................................... 7
               Kommun ................................................................................................7
               Fastighet ................................................................................................8
               Adress ...................................................................................................8
           Resultat ....................................................................................... 10
               Datafält ............................................................................................... 10
               Sortering av resultat ........................................................................... 11
           Begränsning ................................................................................ 12

Publikt API för energideklarationer                                                                                     5

                                      Sammanfattning
                                      Dokumentet ger en kortfattad beskrivning av Boverkets publika API:s
                                      urvalslogik vilka krav som ställs, och hur parametrarna är uppbyggda.
                                      Vidare beskrivs resultatet som det publika API:et returerar, ett urval av
                                      datafält som returneras för varje energideklaration.

           Inledning och läsanvisningar
           Boverkets API är utvecklat för att företag lättare ska kunna få tillgång till
           vissa uppgifter i energideklarationsregistret som behövs i deras verksam-
           het. Dessa kallas för basuppgifter och är bland annat uppgifter om bygg-
           nadens energiklass, energideklarations-ID, energiprestanda (primärener-
           gital), specifik energianvändning (det som tidigare var energiprestanda),
           om radonmätning och ventilationskontroll är utförd och
           när energideklarationen är utförd.

             Urvalslogik
             Det förtillfället enda REST-anropet som exponeras i API:et är en GET-
             metod för att hämta information om energideklarationer. De parametrar
             som anropet tar som indata är kommun, och minst en av fastighet och
             adress.

             I energideklarationssystemet är fältet kommun hårt styrt till en lista med
             valbara kommuner. Detta medför att det är relativt enkelt att göra uppslag
             mot detta fält. Fastighetens beteckning samt byggnadens adress är däre-
             mot fritext-fält vilket gör att databasen blir svårare att söka i för dessa pa-
             rameterar. Var parametrarna till anropet kommer ifrån är okänt, men tro-
             ligtvis är de manuellt inmatade i något integrerande system eller inmatat
             direkt i ett sökfält. Detta innebär att logiken som söker i databasen behö-
             ver tvätta inkommande parametrar och inte enbart kan leta i databasen ef-
             ter data som matchar parametrarna exakt.

             Det är okänt hur användaren eller systemet formatterat inkommande pa-
             rameterar. Nedan finns en mer detaljerad beskrivning för hur urvalet går
             till för respektive parameter.

             Kommun

             En kommuns namn består som mest av två del-texter, men oftast
             endast av en. Data för kommuner med delade kommunnamn har
             sparats i energideklarationssystemets databas ibland med ett bind-
             streck mellan delarna och ibland med mellanslag, ex. Upplands
             Väsby och Upplands-Väsby.

             Logiskt urval för kommun
             1. Inkommande parameter delas upp i dess beståndsdelar. Följande ex-
                empel resulterar i samma beståndsdelar: Upplands-Väsby, Upplands
                Väsby, Upplands- Väsby
             2. Beståndsdelarna sätts ihop till två söksträngar, en med bindestreck
                och en med mellanslag mellan delarna.
             3. De två söksträngarna används sedan med ett exakt uppslag mot ener-
                gideklarationerna.
             Exempel i databas – Upplands Väsby
             Upplands Väsby ger träff
             Upplands-Väsby ger träff
             Upplands – Väsby ger träff
             UpplandsVäsby ger INGEN träff

8                                                                Publikt API för energideklarationer

           Fastighet

           En fastighetsbeteckning består av två delar. Den första delen är en trakt
           som kan bestå av fler del-texter, exempelvis Stora Svampen. Den andra
           delen är en kombination av nummer och tecken, exempelvis 1, 1:1, *1,
           g:1, s:1.

           Logiskt urval för fastighet
           1. Inkommande parameter delas upp i dess beståndsdelar. Följande ex-
              empel resulterar i samma beståndsdelar: Stora-Svampen 1:1, Stora
              Svampen 1:1, Svampen Stora 1:1
           2. Urval mot energideklarationers fastighetsbeteckningar görs genom att
              kontrollera att samtliga beståndsdelar i inkommande parameter finns i
              beståndsdelarna för beteckningen i databasen.
           Exempel i databas – Stora Svampen 1:1
           Stora Svampen 1:1 ger träff
           Stora-Svampen 1:1 ger träff
           Svampen Stora 1:1 ger träff
           Svampen 1:1 ger träff
           Stora 1:1 ger träff
           StoraSvampen 1:1 ger INGEN träff
           Stora Svampen ger INGEN träff

           Adress

           En adress består av två delar. Den första delen är ett gatunamn som kan
           bestå av fler del-texter, exempelvis Stora vägen. Den andra delen, gatu-
           nummer, är en kombination av nummer och tecken, exempelvis 18, 18A,
           18 A.

           Logiskt urval för adress
           1. Inkommande parameter delas upp i dess beståndsdelar. Följande ex-
              empel resulterar i samma beståndsdelar: Stora-Vägen 18A, Stora
              Vägen 18A, Stora Vägen 18 A, Vägen Stora 18A
           2. Urval mot energideklarationers byggnadsadresser görs genom att
              kontrollera att samtliga beståndsdelar i inkommande parameter finns i
              beståndsdelarna för adressen i databasen.
           3. Ett extra urval görs som tillåter att även Stora Vägen 18 ger träff för
              Stora Vägen 18A, Stora Vägen 18B osv.
           Exempel i databas – Stora Vägen 18 A
           Stora Vägen 18 A ger träff
           Stora Vägen 18A ger träff
           Stora-Vägen 18 A ger träff

             Vägen Stora 18 A ger träff
             Stora Vägen 18 ger träff
             Stora Vägen18 ger träff
             StoraVägen 18 ger INGEN träff
             Stora Vägen ger INGEN träff

10                                                              Publikt API för energideklarationer

           Resultat

           Datafält
           API:et returnerar energideklarationer med följande uppgifter.

           energideklarationer      0 eller flera energideklarationer på formatet
                                    energideklaration.

           energideklaration
           id                       Deklarationens unika ID

           energiklass              Värde A-G:
                                        • För deklarationer godkända efter
                                            2014-01-01.
                                        • Eller äldre energideklaration vars
                                            sammanfattning omvandlats.
                                    Värde X
                                       • Deklarationer före 2014-01-01.
           primarenergital          Energiprestanda, primärenergital uttryckt i
                                    kWh/m² och år.
                                    Energiprestanda för deklarationer godkända ef-
                                    ter 2019-01-01.
                                    Deklarationer före 2019-01-01, saknar primär-
                                    energital.
                                    Resultatet innehåller även enhet.

           energiprestanda          Energiprestanda, specifik energianvändning ut-
                                    tryckt i kWh/m² och år.
                                    Energiprestanda för deklarationer gjorda före
                                    2019-01-01.
                                    Hur en byggnads energiprestanda beräknas för-
                                    ändras över tid. Så resultatet påverkas av när
                                    deklarationen utfördes.
                                    Resultatet innehåller även enhet.

           radonmatning             Returnerar "Utförd"/"Inte utförd"

           ventilationskontroll     Returnerar "Utförd"/"Inte utförd"

           byggnadsar               Alltid null

           utford                   Datum då deklarationen har godkänts, ÅÅÅÅ-
                                    MM-DD

           fastigheter              En deklaration innehåller en eller flera fastig-
                                    heter på formatet fastighet.

             fastighet
             kommun                    Hemkommun för deklarerade byggnader.

             fastighetsbeteckning      Fastighetsbeteckning som deklarationen avser.

             adresser                  En deklaration innehåller en eller flera adresser
                                       på formatet adress.

             adress
             adress                    Den deklarerade byggnadens gatuadress.

             postnummer                Den deklarerade byggnadens postnummer.

             postort                   Den deklarerade byggnadens postadress.

             Sortering av resultat

             Resultatet av urvalet sorteras i följande ordning:

             1. Deklarationer i omvänd godkännandordning, dvs. nyaste deklarationer
                först
             2. Fastigheter i alfanumerisk ordning på beteckningen
             3. Adresser i alfanumerisk ordning på gatuadress

12                                                           Publikt API för energideklarationer

           Begränsning
           Det är begränsat hur mycket information som kan hämtas från API:t.
           Följande maxvärden gäller:

           1. 10 anrop per 2 sekunder
           2. 1500 anrop per dygn
           3. 40 000 kilobyte data per dygn


---

## Document 2: Instruktion för Boverkets publika gränssnitt (General API Instructions)

Instruktion för Boverkets
       publika gränssnitt
               Version 1.3

           Innehåll
           Inledning ....................................................................................... 3
           Avtals- och distributionsprocessen................................................ 5
               Användaravtal ....................................................................................... 5
           Orientering i utvecklarportalen ...................................................... 6
               1. Landningssida (Hem) ........................................................................ 6
               2. API-vy (Lista API) ............................................................................. 7
               3. API-beskrivning ................................................................................. 8
               4. Testa API:et (Try It) ........................................................................ 10
               5. Användarprofil-vy (Profil) ................................................................ 12
           Arbetsflöden ................................................................................14

Instruktion för Boverkets publika gränssnitt                                                               3

                      Inledning
                      Detta dokument beskriver handhavande för att få tillgång till av Boverket erbjudna
                      publika användargränssnitt, så kallade API, avsedda att anropas av kundens egen pro-
                      gramvara för att konsumera Boverkets publika tjänster.

                      Som teknikplattform används Microsofts molnlösning (Azure) för att implementera
                      Boverkets publika användargränssnitt och vidare används Microsofts utvecklarportal
                      för distribution av användarinformation och nödvändiga accessnycklar. Utvecklarpor-
                      talen beskrivs i detta dokument.

                      Nedan följer en lista med centrala begrepp.

                      •     Kund – Det företag eller den institution som tecknat avtal med Boverket om att
                            använda publika användargränssnitt hos Boverket.
                      •     Användare – Beteckning på hur en kund registreras i systemet. Härav följer också
                            att en användare representerar ett företag eller en institution. Eventuell distribution
                            av accessmöjligheter till enskilda programvaruutvecklare inom kundens organisat-
                            ion är kundens eget interna ansvar.
                      •     API – Publikt användargränssnitt. I den mån Boverket erbjuder flertalet publika
                            användargränssnitt (API) är det möjligt för kund att teckna enskilt användaravtal
                            per API.
                      •     Abonnemang – Koppling mellan användare och API som ger access till API. För
                            en kund med flera abonnemang mot olika API, kan enskilda abonnemang under-
                            hållas av Boverket individuellt. Exempel på sådant underhåll är att teckna nya
                            abonnemang eller att ta bort existerande.
                      •     Produkt - En administrativ komponent i utvecklarportalen som utgör den faktiska
                            instansen en användare får tillgång till genom sitt abonnemang. Således får en an-
                            vändare, via ett abonnemang en accessrätt till en produkt som i sin tur ger access
                            till ett API.
                      •     Accessnyckel – En komponent som krävs i HTTP-huvudet vid anrop mot ett
                            publikt användargränssnitt. Accessnycklar kan underhållas av kunden själv i ut-
                            vecklarportalen.

     4                                                Instruktion för Boverkets publika gränssnitt

           Relationer mellan API, produkt, abonnemang och användare för enskild kund i Bo-
           verkets implementation:

Instruktion för Boverkets publika gränssnitt                                                             5

                      Avtals- och distributionsprocessen

                      Användaravtal
                      När Boverket tecknat avtal med en kund registreras denna som användare i systemet.
                      För detta krävs uppgifter på för-, efternamn och e-postadress på kundnivå. Via email
                      till den angivna e-postadressen, distribueras en länk där lösenordet ändras till ett per-
                      sonligt. Detta lösenord behövs i ett senare skede för åtkomst i utvecklarportalen, där
                      kan kunden till viss del hantera sina egna abonnemang.

                      Användaravtal tecknas per API som en kund önskar tillgång till. När Boverket tecknat
                      avtal med en kund angående ett API registreras detta i systemet i form av ett abonne-
                      mang som knyter kundens användare till ett API. För varje nytt abonnemang som
                      läggs upp genereras ett välkomst-email. Detta email innehåller en länk till utvecklar-
                      portalen. Om ett nytt konto skapas kommer du även få ett epostmeddelande att byta
                      lösenord.

     6                                                    Instruktion för Boverkets publika gränssnitt

           Orientering i utvecklarportalen
           Nedan beskrivs några av de vyer du, som användare, får tillgång till i utvecklarporta-
           len, tillsammans med kortfattad beskrivning.

           1. Landningssida (Hem)
           Denna vy utgör landningssida for utvecklarportalen. Här finns de länkar du behöver
           för att komma vidare. Här finns också knappen för att logga ut.

           Om du inte är inloggad indikeras detta på samma ställe med texten ”Logga in”.

           De olika funktionerna beskrivs i följande kapitel.

Instruktion för Boverkets publika gränssnitt                                                          7

                      2. API-vy (Lista API)
                      I denna vy listas samtliga publika gränssnitt som en användare har tillgång till. I ex-
                      emplet nedan så har du endast abonnemang mot gränssnittet AZU001 Energideklarat-
                      ioner. Beteckningen AZU001 är en intern etikett men är relevant att uppge vid eventu-
                      ell felanmälan.

     8                                                   Instruktion för Boverkets publika gränssnitt

           3. API-beskrivning
           Genom att klicka på en API-länk enligt bilden ovan, når du en vy som beskriver detta
           API samt erbjuder en möjlighet att testa det mot en verklig bakomliggande service via
           en ”Try It”-knapp.

           Under valet ”API definition” kan du ladda ner API-definitionen i de olika formaten
           OpenAPI och WADML. De exporterade definitionerna kan användas för dokumentat-
           ion eller för att dela API-specifikationen med utvecklare. De olika alternativen är be-
           skrivna i tabellen nedan.

           Format                         Beskrivning

           Open API 3                     Detta är den senaste versionen av OpenAPI-
                                          specifikationen, med stöd för både JSON och YAML.

           Open API 2                     Äldre version av OpenAPI-specifikationen.

           WADL (Web Application          Detta är ett XML-baserat format för att beskriva
           Description Language)          HTTP-baserade webbtjänster. Specifikationen är
                                          äldre med begränsat stöd i Azure API Management.
                                          Den kan importeras men rekommenderas inte.

Instruktion för Boverkets publika gränssnitt                                                         9

                      Bilden ovan visar i vänstermarginalen att det finns en (1) operation (GET). Genom att
                      välja denna så kan du se en detaljerad beskrivning av API-URL och HTTP-fråge-
                      parametrar.

                      Som bilden ovan visar har GET-anropet i detta API tre (3) definierade fråge-
                      parametrar.

     10                                                  Instruktion för Boverkets publika gränssnitt

           4. Testa API:et (Try It)
           Utvecklarportalen tillhandahåller funktionen "Try It" på API-referenssidorna så att
           portalbesökare kan testa dina API:er direkt via en interaktiv konsol.

           Här kan du ändra parametrarna i GET-anropet för att testa hur Boverkets API beter sig
           i olika scenarier.

           Förutom API-URL och HTTP-frågeparametrar måste HTTP-anropet innehålla en ac-
           cessnyckel i huvudet med namnet ”Ocp-Apim-Subscription-Key”.

           Denna nyckel är en viktig del av autentiseringen för Azure API Management. Det är
           en unik identifierare som används för att autentisera anrop till API:er som hanteras av
           Azure API Management och skickas vanligtvis som en HTTP-header i API-anropet.

           Värdet på denna hittar du i användarprofil-vyn, och även under rubriken ”Headers”
           ovan.

           Under sektionen ”HTTP request” kan du få förslag på hur anropet kan utformas bero-
           ende på vilken teknologi ni använder. Du kan till exempel få exempel på hur anropet
           ser ut i olika programmeringsspråk.

Instruktion för Boverkets publika gränssnitt                                                   11

                      Genom at välja ”HTTP” kan du se hur HTTP-anropet ser ut med samtliga parametrar.
                      Anropet skickas med Send-knappen och svaret kan sedan observeras under rubriken
                      ”HTTP Response”.

     12                                                    Instruktion för Boverkets publika gränssnitt

           5. Användarprofil-vy (Profil)
           I denna vy visas en komplett sammanställning av de abonnemang en användare har
           hos Boverket för publika gränssnitt. I det här fallet kan du se att användaren har ett (1)
           abonnemang med namnet ”Förvaltning ED Energideklarationer”, kopplat till en pro-
           dukt med namnet ”Energideklarationer”. Under abonnemangs-namnet listas de två ac-
           cessnycklar som kan användas för anrop av tillhörande API och dessa kan exponeras i
           klartext genom att klicka på ”Show”.

           I kolumnen ”Product” visas en produktbeteckning som är en administrativ komponent
           namngiven av Boverket.

           Du kan själv underhålla dina access-nycklar genom att regenerera dem vid behov om
           de eventuellt kommit på avvägar. Detta sker genom att klicka på ”Regenerate”. Notera
           dock att varje användarapplikation som implementerar motsvarande API-anrop måste
           då uppdateras med nytt värde i ”Ocp-Apim-Subscription-Key”.

           Under ”Profile” visas även epost och namn kopplat till kontot. Vi rekommenderar att
           du ser över namnet, och uppdaterar det vid behov genom att avvända knappen
           ”Change name”.

           Du kan även uppdatera ditt lösenord med hjälp av knappen ”Change password”.

Instruktion för Boverkets publika gränssnitt                                                           13

                      Viktigt!

                      Det finns ett antal möjliga handgrepp som i nuläget inte rekommenderas:

                            •    Ändra namn på abonnemanget (Rename)
                            •    Ta bort ett abonnemang (Cancel), detta sköts företrädesvis av Boverket efter
                                 kontakt. Om detta händer av misstag så måste abonnemanget återskapas. I
                                 princip ska ett nytt avtal sättas upp.
                      Missbruk på ovanstående punkter beivras och kan leda till indraget avtal.

Arbetsflöden
Nedan listas några arbetsflöden:

1. Ändra användarprofil
   Gå till Profil-vyn under inloggningsmenyn och ändra namn vid behov.
2. Testa ett publikt API
   Gå till API-vyn och vidare till relevant API-beskrivnings-vy. Läs om detta API och
   klicka på ”Try it”. Fyll i nödvändig information, exempelvis HTTP-
   frågeparametrar, och klicka ”send”.
3. Utveckla applikation mot ett API
   Börja med att studera API under API-vyn och relevant API-beskrivnings-vy. Visst
   stöd kan fås genom att titta på ”Code samples” längts ned på denna sida. Gå till an-
   vändarprofil-vyn för att inhämta nödvändig accessnyckel för detta API.
4. Accessnyckel ej längre säker
   Gå till användarprofil-vyn och re-generera accessnyckeln för ett abonnemang.
   Samtliga applikationer mot detta abonnemangs API måste nu uppdateras med ny
   accessnyckel.

