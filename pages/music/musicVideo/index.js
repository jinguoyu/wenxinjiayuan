// pages/article/article.js
// WxParse HtmlFormater 用来解析 content 文本为小程序视图
import WxParse from './../../../lib/wxParse/wxParse';
// 把 html 转为化标准安全的格式
import HtmlFormater from './../../../lib/htmlFormater';
var app = getApp();

Page({
  data: {
    options: [],//页面初始化，页面跳转所带来的参数
    msg: '',
    ind: 0,//文章分类
    id: 0, //文章id
    title: '',
    catid: 0, //文章栏目
    img: '',
    froms: '',
    browse: 0,//文章的浏览数
    pinglun: 0,//文章的评论数
    userInfo: null, //用户信息
    textar: '',//发送的评论内容
    commtent: {}, //获取的当前文章的所有评论
    addtime:'',   //文章添加时间
    sh:1  //0正式，1审
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    this.setData({
      options: options
    })
    wx.request({
      url: 'https://www.jinzili.top/index/apiwx/musicVideo',
      data: {
        id: options.id
      },
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        that.setData({
          title: res.data.title,
          img: res.data.thumb,
          msg: res.data.content,
          id: res.data.id,
          browse: res.data.views,
          addtime:res.data.addtime,
          sh:res.data.sh
        })
      }
    })

    //获取评论
    wx.request({
      url: 'https://www.jinzili.top/index/apiwx/getcom',
      data: {
        id: options.id,
        catid:2
      },
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        console.log(res);
        if (res.data == 1) {
          that.setData({
            commtent: 1
          })
        } else {
          that.setData({
            commtent: res.data.info,
            pinglun: res.data.num
          })
        }
      }
    })
  //如果全局变量中有用户信息，则直接获取
  if(app.globalData.userInfo) {
    that.setData({
      userInfo:app.globalData.userInfo
    })
  }

  },

  //下拉刷新
  onPullDownRefresh: function () {
    var that = this;
    var options = that.data.options;
    this.onLoad(options)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var that = this
    var id = that.data.id;
    return {
      title: that.data.title,
      path: "/pages/articleb/articleb?id=" + id,
      imageUrl: that.data.img
    }
  },

  //获取用户信息
  onGotUserInfo: function (e) {
    if (e.detail.userInfo == null) {
      this.getuser();
    } else {
        this.setData({
        userInfo: e.detail.userInfo,
      })
    }
  },

  //表单提交事件
  bindFormSubmit: function (e) {
    var that = this;
    var text = e.detail.value.textarea;
    if (this.data.userInfo == null) {
      this.getuser();
    } else {
      if (text == '') {
        wx.showToast({
          title: '评论内容不能为空',
          icon: 'none',
          duration: 1000
        })
        return;
      } else {
        this.setData({
          textar: e.detail.value.textarea
        })
        this.apipinlun();
      }
    }
  },

  //将评论数据发送给后台
  apipinlun: function () {
    var that = this;
    var options = that.data.options;
    if (this.data.userInfo == null) {
      this.getuser();
    } else {
      wx.request({
        url: 'https://www.jinzili.top/index/apiwx/comment',
        data: {
          newsid: that.data.id,
          name: that.data.userInfo.nickName,
          text: that.data.textar,
          image: that.data.userInfo.avatarUrl,
          catid:2,
          title:that.data.title
        },
        method: 'GET',
        dataType: 'json',
        responseType: 'text',
        success: res => {
          if (res == 1) {
            wx.showToast({
              title: '评论失败请稍后再试',
              icon: 'none',
              duration: 1000,
              mask: true
            })
          } else {
            wx.showToast({
              title: '评论成功',
              icon: 'success',
              duration: 1000,
              mask: true
            })
            that.onLoad(options);
          }
        }
      })
    }
  },

  //弹出用户授权信息
  getuser: function () {
    let that = this
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: function(res) {
              that.setData({
                userInfo: res.userInfo,
              })
            },
            fail: function (res) {
              console.log(res);
            }
          })
        }
      }
    })
  },

})