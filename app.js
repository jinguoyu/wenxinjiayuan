//app.js
import { request } from "./utils/Promise.js";
App({
  globalData: {
    sh:0,  //-1审核，0默认，页面空白，需要访问接口获取状态，1正式,2登录普通用户，3登录授权用户
    userInfo: null,  //用户信息
    openid:null,   //用户的openid
  },

  //获取是否为审核状态
  getshenhe:function (){
    let that = this;
    return new Promise(function (resolve, reject) {
      request({url: 'https://www.jinzili.top/index/apiwx/getShenhe'})
      .then(result=>{
        that.globalData.sh = result.data;
        resolve(result.data);
      })
    })
  },


    //微信登录，获取用户信息和权限。
  login:function(){
    let that = this;
    return new Promise(function (resolve, reject) {
    //弹出用户授权,获取用户基本信息
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: function(res) {
              that.globalData.userInfo = res.userInfo;
              //获取用户信息成功以后进入调用登录接口，获取code。
              wx.login({
                success (res) {
                  if (res.code) {
                    //获取code成功后，发起网络请求
                    wx.request({
                      url: 'https://www.jinzili.top/index/apiwx/wxauth',
                      header:{'content-type':'application/json'},
                      data: {
                        code: res.code,
                        nickName:that.globalData.userInfo.nickName,
                        avatarUrl:that.globalData.userInfo.avatarUrl
                      },
                      success: function (rem) {
                        if(rem.data != 0) {
                          that.globalData.sh = rem.data[0];
                          that.globalData.openid = rem.data[1];
                          resolve(true);
                        } else {
                          wx.showModal({
                            content: '获取权限失败，请退出重试！',
                            showCancel:false,
                          })
                        }
                      },
                      fail:function(res){
                        wx.showToast({
                          title: '获取权限失败:'+res,
                          icon: 'fail',
                          duration: 1000,
                          mask: true
                        })
                      }
                    }
                    
                    )
                  } else {
                    console.log('登录失败！' + res.errMsg)
                  }
                },
                fail: function (res) {
                  wx.showToast({
                    title: '获取code失败:'+res.errMsg,
                    icon: 'fail',
                    duration: 1000,
                    mask: true
                  })
                }
              })
            },
            fail: function (res) {
              wx.showToast({
                title: '获取用户信息失败:'+res.errMsg,
                icon: 'fail',
                duration: 1000,
                mask: true
              })
          
            }
          })
        }
      }
    })
  }







    )},


  
})