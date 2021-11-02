var favUtil = require('../../../utils/fav.js');
var strRe = /\[(\d{2}:\d{2})\.\d{2,}\](.*)/;
const app = getApp()
Page({
	data: {
		zh:'',//歌词
		preid:0,   //上一曲ID
		nextid:0,   //下一曲id
		sh:app.globalData.sh,  //-1审 1正式
		mode:'loop',
		toastHidden: true, //提示信息，默认隐藏
		geci:'geci_n',//歌词是否显示
	},
	async onLoad(param) {
		await  this.reload(param.id);
		this.setData({
			songId: param.id,
			sh:app.globalData.sh
		})
	},

	/**页面刚显示的时**/
	onShow: function() {
		//创建动画
		this.animation = wx.createAnimation({
			duration: 1000,//持续时间
			timingFunction: 'ease',//低速开始，然后加快，结束前变慢
		});
	},

	/**页面隐藏时**/
	onHide: function() {
		this.clearTurner();
	},

	/**页面卸载时**/
	onUnload: function() {
		this.clearTurner();
	},

	/**上一曲**/
	prevEvent: function() {
		let preid = this.data.preid;
		let pid =this.data.pid;
		wx.redirectTo ({
			url: '../musicplay/index?id='+preid+'&sid='+pid
		});
	},

	/**下一曲**/
	nextEvent: function() {
		let nextid = this.data.nextid;
		let nid =this.data.nid;
		wx.redirectTo ({
			url: '../musicplay/index?id='+nextid+'&sid='+nid
		});
	},

	/**点击播放或者暂停**/
	actionEvent: function(e) {
		var method = this.data.status === 'play' ? 'pause' : 'play';
		this.setData({
			status: method,
			action: {
				method: method
			}
		});
		if (method === 'pause') this.clearTurner();
	},

	/**显示或者隐藏歌词**/
	switchbgEvent: function(e) {
		var ci = this.data.geci ==='geci_d' ? 'geci_n' : 'geci_d';
		this.setData({
			lyricHidden: !this.data.lyricHidden,
			geci:ci,
		});
	},

	/**当播放进度条改变的时候触发**/
	timeupdateEvent: function(e) {
		var t = e.detail.currentTime,
			d = e.detail.duration,
			step = this.isEnSong ? 78 : 55,
			list = this.data.lyricList,
			cIndex = this.data.currentIndex;

		if (cIndex < list.length - 1 && t >= list[cIndex + 1].time) {
			this.animation.translateY(-step * (cIndex + 1)).step();

			this.setData({
				currentTime: t,
				currentIndex: cIndex + 1,
				animationData: this.animation.export()
			});
		}

		this.setData({
			per: Math.floor(t / d * 100),
			timeText: this.formatTime(t),
			durationText: this.formatTime(d)
		});

		if (!this.turner && this.data.status === 'play') {
			this.turner = setInterval(() => {
				this.setData({
					deg: this.data.deg + 1,
				})
			}, 50);
		}
	},
	/**获取当前id的歌曲信息**/
	reload: function(id) {
		var that = this
		return new Promise(function (resolve, reject) {
		wx.request({
			url: 'https://www.jinzili.top/index/apiwx/musicshow',
			data: {
				id: id
			},
			method: 'GET',
			dataType: 'json',
			responseType: 'text',
			success: function (res) {
				
				that.clearTurner();
				that.animation.translateY(0).step({
					duration: 1000,
					delay: 100
				});
				that.setData({
				per: 0,
				deg: 0,
				status: 'play',
				lyricHidden: true,
				fav: wx.getStorageSync('fav')[id] ? 'liked' : 'unlike',
				songId: id,
				currentTime: '0',
				currentIndex: -1,
				timeText: '00:00',
				durationText: '',
				animationData: that.animation.export(),
				title: res.data.conent.title,
				picurl: res.data.conent.thumb,
				src: res.data.conent.content,
				nextid:res.data.next,
				preid:res.data.prev,
				nid:res.data.nid,
				pid:res.data.pid,
				zh:res.data.conent.lyrics,
				action: {
					method: 'setCurrentTime',
					data: 0
				},
				lyricList: that.getLyricList(res.data.conent.lyrics),
				favlist: favUtil.getFavList(),
			});
			wx.setNavigationBarTitle({
				title: res.data.conent.title
			});
			setTimeout(() => {
				that.setData({
					action: {
					method: 'play'
					}
				})
			}, 100);
			resolve(res.data);
		}
		})
	})
	},
	getLyricList: function(lyicl) {
		var obj = {},
		lyricList = [],
		zh = lyicl.split('\n');
		zh.forEach(function(str) {
			var arr = str.match(strRe);
			if (!arr) return;
			var k = arr[1],
				v = arr[2] || '(music)';
			if (!obj[k]) obj[k] = {};
			obj[k].zh = v;
		});
		for (var t in obj) {
			var ts = t.split(':');
			var time = parseInt(ts[0]) * 60 + parseInt(ts[1]);
			if (lyricList.length) {
				lyricList[lyricList.length - 1].endtime = time;
			}
			lyricList.push({
				time: time,
				zh: obj[t].zh,
			});
		}
		return lyricList;
	},

	/**和头像旋转有关**/
	clearTurner: function() {
		if (this.turner) {
			clearInterval(this.turner);
			this.turner = null;
		}
	},

	formatTime: function(time) {
		time = Math.floor(time);
		var m = Math.floor(time / 60).toString();
		m = m.length < 2 ? '0' + m : m;

		var s = (time - parseInt(m) * 60).toString();
		s = s.length < 2 ? '0' + s : s;

		return `${m}:${s}`;
	},
	//分享
  onShareAppMessage: function () {
    return {
      title: this.data.title,
      path: "/pages/music/music"
    }
  },
  //切换循环模式
  	switchModeEvent: function(e) {
		var newMode = 'loop';
		var toastMsg = "列表循环";
		if (this.data.mode === 'loop') {
			newMode = 'single';
			toastMsg = "单曲循环";
		} else if (this.data.mode === 'single') {
			newMode = 'random';
			toastMsg = "随机播放";
		}
		this.setData({
			mode: newMode,
			toastMsg: toastMsg,
			toastHidden: false
		})
	},
	//提示信息隐藏
	toastChange: function(e) {
		this.setData({
			toastHidden: true
		});
	},
})