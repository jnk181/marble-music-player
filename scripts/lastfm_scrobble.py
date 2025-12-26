import os
import sys
import time
import requests
import hashlib
import json

# Python script that scrobbles or updates nowplaying at LastFM
# https://www.last.fm/api/auth?api_key=API_KEY

def hashRequest(obj, secretKey):
    string = ''
    items = list(obj.keys())
    items.sort()
    for i in items:
        string += i
        string += obj[i]
    string += secretKey
    stringToHash = string.encode('utf8')
    requestHash = hashlib.md5(stringToHash).hexdigest()
    return requestHash

def getSessionKey(user_token):
    if(lastfm_sessionkey!=""):
        return lastfm_sessionkey
    params = {
            'api_key': lastfm_apikey,
            'method': 'auth.getSession',
            'token': lastfm_token
            }
    requestHash = hashRequest(params, lastfm_secret)
    params['api_sig'] = requestHash
    apiResp = requests.post(lastfm_apihead, params)
    return apiResp.text

def nowPlaying(song_name, album_name, artist_name, session_key):
    params = {
            'method': 'track.updateNowPlaying',
            'api_key': lastfm_apikey,
            'track': song_name,
            'artist': artist_name,
            'album': album_name,
            'sk': session_key
            }
    requestHash = hashRequest(params, lastfm_secret)
    params['api_sig'] = requestHash
    apiResp = requests.post(lastfm_apihead, params)
    print(apiResp.text)
    return apiResp.text

def scrobble(song_name, album_name, artist_name, session_key, timestamp=None):
    # Timestamp - time of playing track
    # Currently this sort of cheats the timestamp protocol
    params = {
            'method': 'track.scrobble',
            'api_key': lastfm_apikey,
            'timestamp': str( int(time.time() - 30) ) if (timestamp is None or timestamp=="") else timestamp,
            'track': song_name,
            'artist': artist_name,
            'album': album_name,
            'sk': session_key
            }
    requestHash = hashRequest(params, lastfm_secret)
    params['api_sig'] = requestHash
    apiResp = requests.post(lastfm_apihead, params)
    print(apiResp.text)
    return apiResp.text

def getToken(apikey):
    req=requests.get("http://ws.audioscrobbler.com/2.0/?method=auth.gettoken&api_key=REPLACEME&format=json")
    return (req.json()['token'])

lastfm_apikey="REPLACEME"
lastfm_secret="REPLACEME"
#lastfm_token=getToken(lastfm_apikey)
#lastfm_token="REPLACEME"
lastfm_sessionkey="REPLACEME"
lastfm_apihead="http://ws.audioscrobbler.com/2.0/"

param_title=sys.argv[1]
param_album=sys.argv[2]
param_artist=sys.argv[3]
param_timestamp=sys.argv[4]

mode=sys.argv[5]

if(mode=="nowplayingupdate"):
    nowPlaying(param_title,param_album,param_artist,lastfm_sessionkey)
if(mode=="scrobble"):
    scrobble(param_title,param_album,param_artist,lastfm_sessionkey,param_timestamp)
