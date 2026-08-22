import urllib.request
import json

def test():
    res = urllib.request.urlopen('http://localhost:8000/api/matches/today')
    matches = json.loads(res.read().decode())
    print(f"Retrieved {len(matches)} matches.")
    for m in matches:
        hn = m['home_team']['name']
        an = m['away_team']['name']
        desc = json.loads(m.get('prediction_description') or '{}')
        ws = desc.get('whoscored', {})
        hm = str(ws.get('home_manager', '')).encode('ascii', 'replace').decode()
        am = str(ws.get('away_manager', '')).encode('ascii', 'replace').decode()
        print(f"Match: {hn} vs {an}")
        print(f"  -> Home Coach: {hm}")
        print(f"  -> Away Coach: {am}")

if __name__ == '__main__':
    test()
