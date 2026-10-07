(() => {
  "use strict";
  const S = {
    general: "https://www.britannica.com/quiz/browse",
    film: "https://www.oscars.org/oscars/ceremonies",
    music: "https://www.britannica.com/art/music",
    gaming: "https://www.computerhistory.org/timeline/",
    random: "https://www.britannica.com/science"
  };
  const c = (id, category, question, answer, distractors, explanation, source = S[category]) => ({ id, category, type: "choice", question, answer, options: [answer, ...distractors], explanation, source });
  const e = (id, category, question, answer, tolerance, unit, explanation, source = S[category]) => ({ id, category, type: "estimate", question, answer, tolerance, unit, explanation, source });
  const o = (id, category, question, answer, explanation, source = S[category]) => ({ id, category, type: "order", question, answer, explanation, source });

  window.PUB_QUIZ_CATEGORIES = Object.freeze({
    general: "Allgemeinwissen",
    film: "Filme & Serien",
    music: "Musik",
    gaming: "Gaming & Internet",
    random: "Unnützes Wissen"
  });

  window.PUB_QUIZ_QUESTIONS = Object.freeze([
    c("g01","general","Was ist die Hauptstadt Australiens?","Canberra",["Sydney","Melbourne","Perth"],"Canberra wurde als Kompromiss zwischen Sydney und Melbourne zur Hauptstadt."),
    c("g02","general","Welcher Planet ist der größte im Sonnensystem?","Jupiter",["Saturn","Neptun","Erde"],"Jupiter hat den größten Durchmesser und die größte Masse aller Planeten."),
    c("g03","general","Wie viele Knochen hat ein erwachsener Mensch normalerweise?","206",["186","226","246"],"Das erwachsene menschliche Skelett besteht typischerweise aus 206 Knochen."),
    c("g04","general","Welches chemische Element hat das Symbol Au?","Gold",["Silber","Kupfer","Argon"],"Au leitet sich vom lateinischen Namen aurum ab."),
    c("g05","general","Welcher Ozean ist flächenmäßig der größte?","Pazifischer Ozean",["Atlantischer Ozean","Indischer Ozean","Arktischer Ozean"],"Der Pazifik bedeckt mehr Fläche als alle Landmassen zusammen."),
    c("g06","general","Bei welcher Temperatur siedet Wasser auf Meereshöhe ungefähr?","100 °C",["80 °C","90 °C","120 °C"],"Bei normalem Luftdruck liegt der Siedepunkt bei 100 Grad Celsius."),
    c("g07","general","Wer malte die Mona Lisa?","Leonardo da Vinci",["Michelangelo","Raffael","Sandro Botticelli"],"Leonardo arbeitete vermutlich mehrere Jahre an dem Porträt."),
    c("g08","general","Für welche Zahl steht L in römischen Zahlen?","50",["10","100","500"],"L ist das römische Zahlzeichen für 50."),
    c("g09","general","Wie viele Kontinente werden im gängigen deutschen Modell gezählt?","7",["5","6","8"],"Üblicherweise werden Europa, Asien, Afrika, Nordamerika, Südamerika, Australien/Ozeanien und Antarktika gezählt."),
    c("g10","general","Was ist die kleinste Primzahl?","2",["0","1","3"],"Zwei ist die einzige gerade Primzahl."),
    e("g11","general","Wie hoch ist der Eiffelturm inklusive Antennen ungefähr?",330,12,"Meter","Mit aktueller Antenne erreicht der Eiffelturm rund 330 Meter.","https://www.toureiffel.paris/en/news/history-and-culture/eiffel-tower-grows-6-metres"),
    o("g12","general","Ordne diese Planeten von der Sonne nach außen.",["Merkur","Venus","Erde","Mars"],"Die Reihenfolge beginnt mit Merkur, gefolgt von Venus, Erde und Mars."),
    c("g13","general","Wie viele Bits bilden ein Byte?","8",["4","10","16"],"Ein Byte besteht in modernen Computersystemen aus acht Bits."),
    c("g14","general","In welchem Jahr wurden die Vereinten Nationen gegründet?","1945",["1919","1939","1955"],"Die UN-Charta trat am 24. Oktober 1945 in Kraft.","https://www.un.org/en/about-us/history-of-the-un"),
    c("g15","general","Welche ist die größte Wüste der Erde?","Antarktis",["Sahara","Arabische Wüste","Gobi"],"Wüsten werden über geringe Niederschläge definiert; damit ist die Antarktis die größte."),

    c("f01","film","Wer führte bei der Filmtrilogie „Der Herr der Ringe“ Regie?","Peter Jackson",["James Cameron","Ridley Scott","George Miller"],"Peter Jackson inszenierte alle drei Kinofilme."),
    c("f02","film","Welcher Film gilt als erster vollständig computeranimierter Langfilm?","Toy Story",["Shrek","Findet Nemo","A Bug's Life"],"Pixars Toy Story kam 1995 ins Kino."),
    c("f03","film","Wie viele Häuser gibt es in Hogwarts?","4",["3","5","7"],"Gryffindor, Hufflepuff, Ravenclaw und Slytherin bilden die vier Häuser."),
    c("f04","film","Wer führte bei „Jurassic Park“ Regie?","Steven Spielberg",["George Lucas","Robert Zemeckis","James Cameron"],"Steven Spielberg inszenierte den Film von 1993."),
    c("f05","film","Welche Pille nimmt Neo in „The Matrix“?","Die rote",["Die blaue","Die grüne","Keine"],"Neo wählt die rote Pille und erfährt die Wahrheit über die Matrix."),
    c("f06","film","Welches Studio produzierte „Chihiros Reise ins Zauberland“?","Studio Ghibli",["Pixar","DreamWorks","Aardman"],"Hayao Miyazakis Film entstand bei Studio Ghibli."),
    e("f07","film","In welchem Jahr kam der erste veröffentlichte Star-Wars-Kinofilm heraus?",1977,0,"Jahr","Der heute als Episode IV bekannte Film startete 1977."),
    o("f08","film","Ordne diese Marvel-Filme nach ihrem Kinostart.",["Iron Man","The Avengers","Black Panther","Avengers: Endgame"],"Die Filme erschienen 2008, 2012, 2018 und 2019."),
    c("f09","film","Welche Agentennummer trägt James Bond?","007",["006","008","009"],"James Bond arbeitet als Agent 007."),
    c("f10","film","Wie heißt die Hauptfigur in „Citizen Kane“?","Charles Foster Kane",["Rick Blaine","Norman Bates","Atticus Finch"],"Orson Welles spielt den Medienmagnaten Charles Foster Kane."),
    c("f11","film","Aus welchem Land stammt der Oscar-Gewinner „Parasite“?","Südkorea",["Japan","China","Thailand"],"Bong Joon-hos Film ist eine südkoreanische Produktion."),
    c("f12","film","Wie heißt Disneys erster abendfüllender Zeichentrickfilm?","Schneewittchen und die sieben Zwerge",["Pinocchio","Fantasia","Dumbo"],"Schneewittchen startete 1937 und war Disneys erster animierter Langfilm."),
    c("f13","film","Wie heißt das Café in „Friends“?","Central Perk",["Monk's Café","Luke's Diner","The Peach Pit"],"Central Perk ist der regelmäßige Treffpunkt der sechs Hauptfiguren."),
    c("f14","film","Welches Format prägt die Serie „The Office“?","Mockumentary",["Musical","Anthologie","Gerichtsdrama"],"Die Serie imitiert mit Interviews und Handkamera einen Dokumentarfilm."),
    c("f15","film","In welchem Jahr fand die erste Oscar-Verleihung statt?","1929",["1919","1939","1949"],"Die erste Academy-Awards-Zeremonie fand 1929 statt.","https://www.oscars.org/oscars/ceremonies/1929"),

    c("m01","music","Wie viele Tasten hat ein modernes Standardklavier?","88",["76","84","96"],"Ein Standardklavier besitzt 52 weiße und 36 schwarze Tasten."),
    c("m02","music","Wer war der Leadsänger von Queen?","Freddie Mercury",["David Bowie","Elton John","Mick Jagger"],"Freddie Mercury prägte Queen bis zu seinem Tod 1991."),
    c("m03","music","Aus welcher Stadt stammen die Beatles?","Liverpool",["London","Manchester","Birmingham"],"Die Band gründete sich in Liverpool."),
    c("m04","music","Wie viele Saiten hat ein Standard-E-Bass üblicherweise?","4",["5","6","8"],"Der klassische E-Bass ist viersaitig gestimmt."),
    c("m05","music","Wie viele vollendete Sinfonien schrieb Beethoven?","9",["7","10","12"],"Beethovens neun Sinfonien gehören zum Kernrepertoire der Klassik."),
    c("m06","music","In welchem Jahr erschien Queens „Bohemian Rhapsody“?","1975",["1969","1978","1981"],"Das Stück erschien 1975 auf dem Album A Night at the Opera."),
    c("m07","music","Aus welchem Land stammt ABBA?","Schweden",["Norwegen","Dänemark","Finnland"],"ABBA wurde in Stockholm gegründet."),
    c("m08","music","Aus welchem Land stammt Daft Punk?","Frankreich",["Belgien","Kanada","Deutschland"],"Das elektronische Duo wurde in Paris gegründet."),
    c("m09","music","Welcher Notenschlüssel wird meist für hohe Stimmen verwendet?","Violinschlüssel",["Bassschlüssel","Altschlüssel","Tenorschlüssel"],"Der Violinschlüssel legt das eingestrichene g fest."),
    c("m10","music","Wofür steht BPM?","Beats per minute",["Bars per melody","Bass pitch mode","Beats per measure"],"BPM gibt die Anzahl der Schläge pro Minute an."),
    c("m11","music","In welchem Jahr fand der erste Eurovision Song Contest statt?","1956",["1946","1960","1966"],"Der erste Wettbewerb fand 1956 in Lugano statt.","https://eurovision.tv/history/origins-of-eurovision"),
    o("m12","music","Ordne diese Songs nach Veröffentlichung.",["Billie Jean","Smells Like Teen Spirit","Crazy in Love","Rolling in the Deep"],"Die Songs erschienen 1983, 1991, 2003 und 2010."),
    c("m13","music","Mit welcher Geschwindigkeit läuft eine typische LP?","33⅓ U/min",["16⅔ U/min","45 U/min","78 U/min"],"Langspielplatten werden üblicherweise mit 33⅓ Umdrehungen pro Minute abgespielt."),
    c("m14","music","Was stellt die Grammy-Trophäe dar?","Ein Grammofon",["Ein Mikrofon","Eine Schallplatte","Eine Note"],"Die goldene Trophäe ist ein Grammofon."),
    c("m15","music","Wie viele Saiten hat eine typische Ukulele?","4",["3","5","6"],"Die verbreitetsten Ukulelen besitzen vier Saiten."),

    c("i01","gaming","Wer erfand das World Wide Web?","Tim Berners-Lee",["Bill Gates","Steve Wozniak","Linus Torvalds"],"Tim Berners-Lee entwickelte das Web ab 1989 am CERN.","https://home.cern/science/computing/birth-web"),
    c("i02","gaming","Zu welchem Unternehmen gehört die Figur Mario?","Nintendo",["Sega","Sony","Atari"],"Mario ist Nintendos bekannteste Spielfigur."),
    c("i03","gaming","Wer entwickelte Minecraft ursprünglich?","Markus Persson",["Gabe Newell","John Carmack","Hideo Kojima"],"Markus „Notch“ Persson veröffentlichte die ersten Versionen."),
    c("i04","gaming","Wer entwarf das ursprüngliche Tetris?","Alexei Paschitnow",["Shigeru Miyamoto","Sid Meier","Will Wright"],"Paschitnow entwickelte Tetris 1984 in Moskau."),
    c("i05","gaming","In welchem Jahr erschien die erste PlayStation in Japan?","1994",["1989","1992","1996"],"Sony veröffentlichte die Konsole im Dezember 1994."),
    c("i06","gaming","Wofür steht der HTTP-Statuscode 404?","Nicht gefunden",["Zugriff erlaubt","Server überlastet","Weiterleitung"],"404 bedeutet, dass die angeforderte Ressource nicht gefunden wurde."),
    c("i07","gaming","Wofür steht CSS?","Cascading Style Sheets",["Computer Style Syntax","Creative Screen System","Coded Site Structure"],"CSS beschreibt Darstellung und Layout von Webdokumenten."),
    c("i08","gaming","Welche Sprache strukturiert den Inhalt einer Webseite?","HTML",["CSS","SQL","PNG"],"HTML ist die Auszeichnungssprache für Webinhalte."),
    c("i09","gaming","Wie heißt Segas blauer Igel?","Sonic",["Tails","Knuckles","Shadow"],"Sonic ist seit 1991 Segas Maskottchen."),
    c("i10","gaming","Wie heißt die Spielfigur, die Zelda meist rettet?","Link",["Ganon","Epona","Tingle"],"Der spielbare Held der Reihe heißt Link."),
    c("i11","gaming","Welches Unternehmen betreibt Steam?","Valve",["Epic Games","Ubisoft","Electronic Arts"],"Valve startete die Plattform Steam 2003."),
    e("i12","gaming","In welchem Jahr erschien der originale Nintendo Game Boy?",1989,0,"Jahr","Der Game Boy kam 1989 zunächst in Japan auf den Markt."),
    o("i13","gaming","Ordne diese Spiele nach Erstveröffentlichung.",["Pong","Super Mario Bros.","Doom","Minecraft"],"Die Spiele erschienen 1972, 1985, 1993 und 2009."),
    c("i14","gaming","Welche beiden Werte kennt ein einzelnes Binärbit?","0 und 1",["1 und 2","A und B","−1 und 1"],"Ein Bit repräsentiert einen von zwei Zuständen: 0 oder 1."),
    c("i15","gaming","Wie viele farbige Geister verfolgen Pac-Man im Original?","4",["3","5","6"],"Blinky, Pinky, Inky und Clyde sind die vier Geister."),

    c("u01","random","Wie viele Herzen hat ein Oktopus?","3",["1","2","4"],"Oktopusse besitzen ein systemisches und zwei Kiemenherzen."),
    c("u02","random","Was ist eine Banane botanisch betrachtet?","Eine Beere",["Eine Nuss","Eine Steinfrucht","Ein Gemüse"],"Botanisch erfüllt die Banane die Merkmale einer Beere."),
    c("u03","random","Welche Form hat der Kot eines Wombats?","Würfelförmig",["Kugelförmig","Spiralförmig","Sternförmig"],"Wombats produzieren durch ihren besonderen Darm würfelförmigen Kot."),
    c("u04","random","Warum sind Flamingos rosa?","Durch Farbstoffe in der Nahrung",["Durch Sonnenlicht","Durch Meerwasser","Durch ihr Alter allein"],"Carotinoide aus Algen und Krebstieren färben das Gefieder."),
    c("u05","random","Welches Lebensmittel kann bei richtiger Lagerung extrem lange haltbar bleiben?","Honig",["Milch","Toastbrot","Gurke"],"Honig hemmt durch wenig Wasser und seine Chemie das Wachstum vieler Mikroorganismen."),
    c("u06","random","Wie heißt eine Gruppe Krähen auf Englisch traditionell?","A murder",["A parliament","A crash","A tower"],"Der traditionelle englische Sammelbegriff lautet murder of crows."),
    c("u07","random","Welches Fabelwesen gilt als Nationaltier Schottlands?","Einhorn",["Drache","Phönix","Greif"],"Das Einhorn ist seit Jahrhunderten ein schottisches Wappentier.","https://www.visitscotland.com/inspiration/culture/national-animal-unicorn"),
    c("u08","random","Welchen Grundgeschmack können Katzen kaum wahrnehmen?","Süß",["Bitter","Sauer","Salzig"],"Katzen fehlt ein funktionsfähiger Rezeptor für süßen Geschmack."),
    c("u09","random","Was passiert mit dem Eiffelturm bei Sommerhitze?","Er wird etwas höher",["Er wird kürzer","Er dreht sich","Er verfärbt sich blau"],"Metall dehnt sich bei Wärme aus; der Turm kann dadurch einige Zentimeter wachsen."),
    c("u10","random","Welche Summe ergeben gegenüberliegende Seiten eines normalen Würfels?","7",["6","8","9"],"Die Paare 1/6, 2/5 und 3/4 ergeben jeweils sieben."),
    c("u11","random","Wie heißt der typische Geruch nach Regen auf trockenem Boden?","Petrichor",["Aurora","Umami","Mistral"],"Petrichor bezeichnet den erdigen Geruch nach Regen."),
    e("u12","random","Wie viele Minuten dauerte der Anglo-Sansibar-Krieg 1896 ungefähr?",38,7,"Minuten","Der Konflikt gilt mit ungefähr 38 bis 45 Minuten als kürzester Krieg der Geschichte."),
    c("u13","random","Wie viele Karten hat ein Standardkartenspiel ohne Joker?","52",["48","54","60"],"Vier Farben mit je 13 Karten ergeben 52."),
    c("u14","random","Was ist eine Erdnuss botanisch?","Eine Hülsenfrucht",["Eine echte Nuss","Eine Beere","Ein Getreide"],"Erdnüsse gehören wie Bohnen und Erbsen zu den Hülsenfrüchten."),
    c("u15","random","Wofür stehen die beiden M in M&M's?","Mars und Murrie",["Milk und Malt","Mix und Melt","Miller und Morgan"],"Der Name verweist auf Forrest Mars und Bruce Murrie."),
  ]);
})();
