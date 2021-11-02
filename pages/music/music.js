//获取应用实例
const app = getApp()

Page({
  data: {
    focus: {},
    newslist: {},
    ye: 1,
    err: 0,
    loading: true,
    state:'music',    //当前是哪个栏目，默认是音频
    sh:app.globalData.sh  //-1审 1正式
  },

   //请求最新的音频数据
  getmusic:function(){
    let that =this;
    wx.request({
      url: 'https://www.jinzili.top/index/apiwx/music',
      data: '',
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        that.hideLoading();  
        if(res.data==1){
          that.setData({
            err:1
          })
        }else{
              that.setData({
                newslist: res.data.data,
                state:'music',
                ye:1,
                sh:res.data.sh
              })
        }
      },
     })
  },
   //请求最新的视频数据
  getvideo:function(){
    let that =this;
    wx.request({
      url: 'https://www.jinzili.top/index/apiwx/video',
      data: '',
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        that.hideLoading();  
        if(res.data==1){
          that.setData({
            err:1
          })
        }else{
          that.setData({
            newslist: res.data.data,
            state:'video',
            sh:res.data.sh
          })
        }
      },
    })
  },
  /**显示加载中*/
  showLoading() {
    wx.showNavigationBarLoading();
    this.setData({
        subtitle: '加载中...',
        loading: true,
    });
  },

  /**不显示加载中**/
  hideLoading() {
    wx.hideNavigationBarLoading();
    wx.stopPullDownRefresh();
    this.setData({
        loading: false
    });
  },
        /**
     * [onLoad 载入页面时执行的生命周期初始函数]
     */
  onLoad() {
    this.showLoading();
    this.setData({
      state:'music'
    });
    this.getmusic();
  },

  /**下拉刷新**/
  onPullDownRefresh: function () {
    this.onLoad()
  },

  /**分享**/
  onShareAppMessage: function () {
    return {
      title: "金自力作品",
      path: "/pages/music/music"
    }
  },

  /**上拉触底 --就是页面翻到最底部的时候触发函数**/
  onReachBottom: function (e) {
    let that = this
    if(that.data.err !=1){
      that.setData({
        page: ++that.data.ye
      })
      wx.request({
        url: 'https://www.jinzili.top/index/apiwx/'+that.data.state,
        data: {
          p: that.data.ye
        },
        method: 'GET',
        dataType: 'json',
        responseType: 'text',
        success: function (res) {
          if (res.data == 1) {
            that.setData({
              err: 1
            })
          } else {
            that.setData({
              newslist: that.data.newslist.concat(res.data.data)
            })
          }
        },
      })
    }
  },

  /**头部切换为音频**/
  clickmusic: function () {
    this.showLoading();
    this.setData({
      state:'music',
      newslist:{}
    });
    this.getmusic();
  },

  /**头部切换为视频列表**/
  clickvideo: function () {
     this.showLoading();
    this.setData({
      state:'video',
      newslist:{}
    });
    this.getvideo();
  },

    //点击tabbar时触发
  onTabItemTap(item) {
    this.setData({
      state:'music',
      newslist: {},
    });
    this.getmusic();
  }

})
