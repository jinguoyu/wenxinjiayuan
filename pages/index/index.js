//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    newslist: {},//文章列表
    loading: true, //加载中
    ye: 1,//第几页
    err: 0,
    state:'health',    //当前是哪个栏目，默认是健康百科
    sh: app.globalData.sh,   //判断是否审核，是否授权
    inputShowed: false,
    search:''//搜索内容
  },

  /**显示加载*/
  showLoading() {
    wx.showNavigationBarLoading();
    this.setData({
      subtitle: '加载中...',
      loading: true,
    });
  },

  /**不显示加载**/
  hideLoading() {
    wx.hideNavigationBarLoading();
    wx.stopPullDownRefresh();
    this.setData({
      loading: false
    });
  },

  /**
    * [onLoad 载入页面时执行的生命周期初始函数]
    * @return {[type]} [description]
  */
  async onLoad() {
    let that = this;
    this.showLoading();
    if(app.globalData.sh ==0){
      await app.getshenhe();
      this.setData({
        sh:app.globalData.sh
      })
    }
    let sh = this.data.sh;

    //判断是审核还是正式环境
    if(sh >0){
      this.getnews();
    } else if (sh==0){
      that.hideLoading();
      wx.showToast({
        title: '网络不稳定，请刷新重试',
        icon: 'none',
        duration: 10000
      })
    } else {
      that.hideLoading();
    }
  },

  //请求最新的文章数据
  getnews:function(){
    let that =this;
    wx.request({
      url: 'https://www.jinzili.top/index/apiwx/news',
      data: {p:1,parma:this.data.state,search:this.data.search},
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        that.hideLoading();
        that.setData({
          newslist: res.data,
        });        
      },
    })
    if(that.data.state =='health'){
      wx.setNavigationBarTitle({
        title: '健康小百科'
      })
    }else if(that.data.state =='antifraud')
    wx.setNavigationBarTitle({
      title: '防骗指南'
    })
  },

 //请求最新的短片
 getshortlist:function(){
  let that =this;
    wx.request({
      url: 'https://www.jinzili.top/index/apiwx/shortlist',
      data: {p:1,search:this.data.search},
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        that.hideLoading(); 
        that.setData({
          newslist: res.data,
          state:'shortlist',
          ye:1
        });        
      
      },
    })

  wx.setNavigationBarTitle({
      title: '优秀短片'
    })
},

  //下拉刷新
  onPullDownRefresh: function () {
    this.onLoad();
  },
  //上拉触底 --加载更多
  onReachBottom: function (e) {
    let that = this
    let err = this.data.err;
    let state = this.data.state;
    let onurl = ''

    if(err == 0) {
        that.setData({
          page: ++that.data.ye
        });
      if(state =='shortlist'){
        onurl = 'https://www.jinzili.top/index/apiwx/shortlist'
      } else {
        onurl = 'https://www.jinzili.top/index/apiwx/news'
      }
      wx.request({
        url: onurl,
        data: {
          p: that.data.ye,
          parma:this.data.state,
          search:this.data.search
        },
        method: 'GET',
        dataType: 'json',
        responseType: 'text',
        success: function (res) {
          console.log('aaaa');
          console.log(res);
          if (res.data =='') {
            that.setData({
              err: 1
            });
          } else {
            that.setData({
              newslist: that.data.newslist.concat(res.data)
            })
          }
        },
      })      
    }
  },

  //健康小百科
  clickhealth: function () {
    this.showLoading();
    this.setData({
      state: 'health',
      search:''
    });
    this.hideInput();
    this.resetData();
    this.getnews();
  },

  //防骗指南
  clickantifraud: function () {
    this.showLoading();
    this.setData({
     state: 'antifraud',
     search:''
   });
   this.hideInput();
   this.resetData();
   this.getnews();
  },

 //优秀短片
  clickshortlist: function () {
    this.showLoading();
    this.setData({
      state: 'shortlist',
      search:''
    });
    this.hideInput();
    this.resetData();
    this.getshortlist();
  },

  //将原来的数据清空
  resetData: function () {
   this.setData({
     newslist:{},
     err: 0,
     ye:1
   });
  },

  //点击tabbar时触发
  onTabItemTap(item) {
    this.setData({
      state:'news',
      search:''
   });
  },

  //加载图片出错时使用默认图片
  onImageError:function (ev) {
    var errImg = ev.target.dataset.errImg;
    var errObj = {};
    errObj[errImg] = '../../img/default.jpg';
    this.setData(errObj);
  },

   //分享
   onShareAppMessage: function () {
    let state = this.data.state;
    if(state=='health'){
      return {
        title: "健康小百科",
        path: "/pages/index/index"
      }
    } else if(state=='antifraud') {
      return {
        title: "防骗指南",
        path: "/pages/index/index"
      }
    } else if (state=='shortlist') {
      return {
        title: "优秀短片",
        path: "/pages/index/index"
      }
    }
  },

  // 分享到朋友圈
  onShareTimeline: function() {
    let state = this.data.state;
    if(state=='health') {
      return {
        title: "温馨家园网--健康小百科",
        query:'',
        imageUrl: ""
      }
    } else if(state=='antifraud') {
      return {
        title: "温馨家园网--防骗指南",
        query:'',
        imageUrl: ""
      }
    } else if(state=='shortlist') {
      return {
        title: "温馨家园网--优秀短片",
        query:'',
        imageUrl: ""
      }
    }
  },

  //搜索
  inputTyping:function(item) {
    let state = this.data.state;
    this.setData({
      search:item.detail.value,
      err:0,
      ye:1
    })
    if(state=='shortlist'){
      this.getshortlist();
    } else {
      this.getnews();
    }
  },

  //显示搜搜索
  showInput: function () {
    this.setData({
        inputShowed: true
    });
  },

  //隐藏搜索
  hideInput: function () {
    let state = this.data.state;
    this.setData({
      inputVal: "",
      inputShowed: false,
      search:''
    });
    if(state=='shortlist'){
      this.getshortlist();
    } else {
      this.getnews();
    }
  },

  //清除输入
  clearInput: function () {
    this.setData({
      inputVal: "",
    });
  }
})
