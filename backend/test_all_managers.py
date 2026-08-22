import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from app.services.ml_predictor import get_team_manager

def test():
    clubs = [
        ("Premier League", "Arsenal FC", "Mikel Arteta"),
        ("Premier League", "Liverpool FC", "Andoni Iraola"),
        ("Premier League", "Manchester City FC", "Enzo Maresca"),
        ("Premier League", "Manchester United FC", "Michael Carrick"),
        ("Premier League", "Chelsea FC", "Xabi Alonso"),
        ("Premier League", "Tottenham Hotspur FC", "Roberto De Zerbi"),
        ("Premier League", "Nottingham Forest FC", "Oliver Glasner"),
        ("Premier League", "Everton FC", "David Moyes"),
        ("Premier League", "Wolverhampton Wanderers FC", "César Peixoto"),
        ("Premier League", "AFC Bournemouth", "Marco Rose"),
        ("Premier League", "Crystal Palace FC", "Pierre Sage"),
        ("Premier League", "Fulham FC", "Álvaro Arbeloa"),
        ("Premier League", "Ipswich Town FC", "Gary O'Neil"),
        ("Premier League", "West Ham United FC", "Graham Potter"),
        ("Championship", "Coventry City FC", "Frank Lampard"),
        ("Championship", "Hull City AFC", "Tim Walter"),
        ("Championship", "Leeds United FC", "Daniel Farke"),
        ("Championship", "Burnley FC", "Nicky Hayen"),
        ("Championship", "Sheffield United FC", "Chris Wilder"),
        ("Championship", "Norwich City FC", "Philippe Clement"),
        ("Championship", "Middlesbrough FC", "Kim Hellberg"),
        ("Championship", "West Bromwich Albion FC", "James Morrison"),
        ("La Liga", "Real Madrid CF", "José Mourinho"),
        ("La Liga", "FC Barcelona", "Hansi Flick"),
        ("La Liga", "Club Atlético de Madrid", "Diego Simeone"),
        ("La Liga", "Real Sociedad de Fútbol", "Pellegrino Matarazzo"),
        ("La Liga", "Athletic Club", "Edin Terzić"),
        ("La Liga", "Villarreal CF", "Íñigo Pérez"),
        ("La Liga", "Sevilla FC", "Luis García Plaza"),
        ("La Liga", "Valencia CF", "Carlos Corberán"),
        ("La Liga", "RCD Espanyol de Barcelona", "Manolo González"),
        ("Serie A", "FC Internazionale Milano", "Cristian Chivu"),
        ("Serie A", "Juventus FC", "Luciano Spalletti"),
        ("Serie A", "AC Milan", "Rúben Amorim"),
        ("Serie A", "SSC Napoli", "Massimiliano Allegri"),
        ("Serie A", "AS Roma", "Gian Piero Gasperini"),
        ("Serie A", "SS Lazio", "Gennaro Gattuso"),
        ("Serie A", "Atalanta BC", "Maurizio Sarri"),
        ("Serie A", "ACF Fiorentina", "Fabio Grosso"),
        ("Serie A", "Bologna FC 1909", "Domenico Tedesco"),
        ("Bundesliga", "FC Bayern München", "Vincent Kompany"),
        ("Bundesliga", "Bayer 04 Leverkusen", "Kasper Hjulmand"),
        ("Bundesliga", "Borussia Dortmund", "Niko Kovač"),
        ("Bundesliga", "RB Leipzig", "Martín Demichelis"),
        ("Bundesliga", "Eintracht Frankfurt", "Albert Riera"),
        ("Bundesliga", "1. FSV Mainz 05", "Urs Fischer"),
        ("Bundesliga", "Borussia Mönchengladbach", "Eugen Polanski"),
        ("Bundesliga", "SV Werder Bremen", "Daniel Thioune"),
        ("Ligue 1", "Paris Saint-Germain FC", "Luis Enrique"),
        ("Ligue 1", "Olympique de Marseille", "Bruno Genesio"),
        ("Ligue 1", "Olympique Lyonnais", "Paulo Fonseca"),
        ("Ligue 1", "AS Monaco FC", "Filipe Luís"),
        ("Ligue 1", "Lille OSC", "Davide Ancelotti"),
        ("Ligue 1", "Stade Rennais FC", "Franck Haise"),
        ("Ligue 1", "RC Lens", "Dino Toppmöller"),
        ("Ligue 1", "RC Strasbourg Alsace", "Hugo Oliveira"),
        ("Ligue 1", "AS Saint-Étienne", "Ian Cathro"),
        ("Primeira Liga", "Sporting Clube de Portugal", "Rui Borges"),
        ("Primeira Liga", "Sport Lisboa e Benfica", "Marco Silva"),
        ("Primeira Liga", "FC Porto", "Francesco Farioli"),
        ("Primeira Liga", "Sporting Clube de Braga", "Carlos Vicens"),
        ("Primeira Liga", "Vitória SC", "João Pereira"),
        ("Eredivisie", "AFC Ajax", "Míchel"),
        ("Eredivisie", "Feyenoord Rotterdam", "Giovanni van Bronckhorst"),
        ("Eredivisie", "PSV Eindhoven", "Peter Bosz"),
        ("Série A (Brazil)", "CR Flamengo", "Filipe Luís"),
        ("Série A (Brazil)", "SE Palmeiras", "Abel Ferreira"),
        ("Série A (Brazil)", "Botafogo FR", "Artur Jorge"),
        ("Série A (Brazil)", "SC Internacional", "Roger Machado"),
        ("Série A (Brazil)", "EC Vitória", "Thiago Carpini"),
        ("European / UCL", "Galatasaray SK", "Okan Buruk"),
        ("European / UCL", "Fenerbahçe SK", "José Mourinho"),
        ("European / UCL", "Club Brugge KV", "Nicky Hayen"),
        ("European / UCL", "FK Bodø/Glimt", "Kjetil Knutsen"),
        ("National Team", "Spain", "Luis de la Fuente"),
        ("National Team", "England", "Thomas Tuchel"),
        ("National Team", "Argentina", "Lionel Scaloni"),
        ("National Team", "Brazil", "Dorival Júnior"),
    ]

    print("=== VERIFYING 2026/2027 SEASON MANAGERS ACROSS ALL LEAGUES ===")
    all_passed = True
    for league, club, expected in clubs:
        actual = get_team_manager(club)
        match_str = "PASS" if actual == expected else f"FAIL (Expected: {expected})"
        if actual != expected:
            all_passed = False
        line = f"[{league:17}] {club:32} -> {actual:22} [{match_str}]"
        print(line.encode("ascii", "replace").decode())

    print("\n" + ("="*60))
    if all_passed:
        print("ALL 2026/2027 SEASON TESTS PASSED: 100% accurate!")
    else:
        print("SOME TESTS FAILED! Please review mappings above.")

if __name__ == '__main__':
    test()
