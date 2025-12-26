class YumbooruMusicPlayerJS {
    constructor() {
        this.isPlaying=0;
        this.currentIndex=0;
        this.tracks = [];
        this.shuffleMode=false;
        this.audioPlayback = new Audio();
        this.loop_audio=false;
        this.onplay = (track_path) => {}
        this.onpause = () => {}
        this.onstop = () => {}
        this.onnext = () => {}
        this.onprev = () => {}
        this.onloop = () => {}
        //this.audioPlayback.preload='none';
        this.audioPlayback.addEventListener('ended', () => {
            //this.next();
            if(this.loop_audio){
                this.audioPlayback.currentTime = 0;
                this.audioPlayback.play();
                this.onloop();
            }
        });
        this.audioPlayback.addEventListener('pause', () => {
            this.onpause();
        });
        this.audioPlayback.addEventListener('play', () => {
            this.onplay();
        });
    }

    addTrack(str) {
        this.tracks.push(str);
        this.audioPlayback.src=this.tracks[0];
        this.audioPlayback.load();
    }

    play() {
        this.isPlaying=1;
        if(this.audioPlayback.src=='')
        {
            this.audioPlayback.src=this.tracks[this.currentIndex];
        }
        this.audioPlayback.play();
        this.onplay(this.audioPlayback.src);
    }

    pause() {
        this.isPlaying=0;
        this.audioPlayback.pause();
        this.onpause();
    }

    playpause()
    {
        if(this.audioPlayback.paused)
        {
            this.play();
        }
        else
        {
            this.pause();
        }
    }

    stop() {
        this.audioPlayback.pause();
        this.audioPlayback.currentTime=0;
        this.onstop();
    }

    // gotoTrack(num) {
    //     this.stop()
    //     this.audioPlayback.src=this.tracks[num]
    // }

    setPosition(timestamp_in_milliseconds) {
        this.audioPlayback.currentTime=timestamp_in_milliseconds/1000;
    }

    next() {
        this.onnext();
        console.log(this.tracks[this.currentIndex+1]!=null);
        console.log(this.tracks,this.currentIndex+1)
        if(this.tracks[this.currentIndex+1]!=null)
        {
            this.currentIndex=this.currentIndex+1;
            this.audioPlayback.src=this.tracks[this.currentIndex];
            this.play();
        }
        else
        {
            this.stop();
            this.currentIndex=0;
        }
    }

    prev() {
        this.onprev();
        if(this.tracks[this.currentIndex-1]!=null)
        {
            this.currentIndex=this.currentIndex-1;
            this.audioPlayback.src=this.tracks[this.currentIndex];
            this.play();
        }
    }

    getIndex() {
        return this.currentIndex;
    }

    restart() {

    }

    gotoTrack(num) {
        num=parseInt(num)
        this.currentIndex=num;
        this.audioPlayback.src=this.tracks[this.currentIndex];
        this.play();
    }

    currentSource() {
        return {audioPath: this.audioPlayback.src};
    }

    removeAllTracks() {
        this.stop();
        this.tracks = [];
    }

    currentLength() {
        return this.audioPlayback.duration*1000;
    }

    currentPosition() {
        return this.audioPlayback.currentTime*1000;
    }

    getTracks() {
        return this.tracks;
    }

    setVolume(value) {
        this.audioPlayback.volume=value;
    }

}
