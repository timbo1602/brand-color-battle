(() => {
  "use strict";
  const l=(id,title,focus,texts,mode="text")=>({id,title,focus,texts,mode});
  window.TYPE_RUSH_LESSONS=Object.freeze([
    l("home-left","1 · Grundreihe linke Hand","A S D F",["asdf asdf fdsa sad fad das","das fad dass saal fass","asdf das fass sad fad"]),
    l("home-right","2 · Grundreihe rechte Hand","J K L Ö",["jklö jklö ölkj lölj","joll kohl ölkj klö","jklö kohl loll ölkj"]),
    l("home-full","3 · Vollständige Grundreihe","A S D F J K L Ö",["das glas soll klar sein","falls das glas fällt","jola saß da als das glas fiel"]),
    l("top-row","4 · Obere Buchstabenreihe","Q W E R T Z U I O P Ü",["wir tippen ruhig weiter","papier wird heute sortiert","wer tippt zur probe zwei worte"]),
    l("bottom-row","5 · Untere Buchstabenreihe","Y X C V B N M",["benni mixt zehn bananen","max nimmt zwei boxen mit","yvonnes taxi kommt bequem"]),
    l("uppercase","6 · Großschreibung","SHIFT",["Heute Tippen Wir Bewusst Groß.","Berlin, Hamburg und Köln sind Städte."]),
    l("numbers","7 · Zahlen","0–9",["2026 spielen 9 teams in 3 runden","5 plus 7 sind 12 und 8 mal 8 sind 64"]),
    l("punctuation","8 · Satzzeichen",".,!?;:-",["Bereit, fertig, los! Tippe: schnell; aber genau.","Warum? Darum! Punkt, Komma und Doppelpunkt: sitzen."]),
    l("words","9 · Häufige deutsche Wörter","WÖRTER",["und der die das ist mit nicht ein eine auf für", "heute gehen wir gemeinsam durch die neue runde", "ich kann jeden tag etwas schneller und genauer tippen"]),
    l("sentences","10 · Vollständige Sätze","FLUSS",["Ein klarer Rhythmus ist wichtiger als hektische Geschwindigkeit.","Die Finger bleiben ruhig auf der Grundreihe und finden jede Taste."]),
    l("speed","11 · Speed Challenge","TEMPO",["Tempo entsteht durch Übung, nicht durch Druck. Bleib locker und tippe diesen Text so flüssig wie möglich. Jede korrekte Taste bringt dich dem nächsten persönlichen Rekord näher.","Schnelle Finger, klarer Kopf: Wer gleichmäßig schreibt, erreicht am Ende meist mehr als jemand, der nur auf Höchsttempo setzt."],"timed"),
    l("accuracy","12 · Genauigkeits-Challenge","PRÄZISION",["Präzision gewinnt: Überprüfe Umlaute, Großschreibung, Zahlen 1 bis 9 und jedes einzelne Satzzeichen!", "Fehlerfrei zu tippen ist eine Kunst; 100 % Genauigkeit sind heute das eigentliche Ziel."],"accuracy")
  ]);
})();
