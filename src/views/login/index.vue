<template>
  <div id="app">
    <div class="login-container">
      <div class="login-box">
        <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules">
          <!-- // prop 使得校验规则能够关联 校验信息 -->
          <img src="./logo_index.png" alt />
          <el-form-item prop="mobile">
            <el-input v-model="loginForm.mobile" placeholder="请输入手机号码">
              <i slot="prefix" class="iconfont icon-shouji"> </i>
            </el-input>
          </el-form-item>
          <el-form-item prop="code">
            <el-input v-model="loginForm.code" placeholder="请输入验证码">
              <i slot="prefix" class="iconfont icon-yanzheng"> </i>
            </el-input>
          </el-form-item>
          <el-form-item prop="xieyi">
            <el-checkbox v-model="loginForm.xieyi">
              我已阅读并同意
              <a href="#">用户协议</a>和
              <a href="#">隐私条款</a>
            </el-checkbox>
          </el-form-item>
          <el-form-item>
            <el-button  :loading="isActive" :disabled="isActive"  style="width:100%;" type="primary" @click="login()">登录</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import './gt.js'
import '@/assets/font/iconfont.css'
export default {
  name: '',
  data () {
    // 自定义校验函数,验证协议
    var xieyiTest = function (rule, value, callback) {
      value ? callback() : callback(new Error('请阅读协议.'))
    }

    return {
      ctaObj: null,
      isActive: false,
      loginForm: {

        mobile: '18754044333',
        code: '246810',
        xieyi: true
      },
      loginFormRules: {
        // 名称{
        //        规则
        //    }
        mobile: [
          {
            required: true,
            message: '手机号码必填'
          },
          { pattern: /^1[35789]\d{9}$/, message: '手机号码格式不对' }
        ],
        code: [
          {
            required: true,
            message: '必填'
          }
        ],
        xieyi: [
          {
            validator: xieyiTest
          }
        ]
      }
    }
  },

  methods: {

    login () {
      // 表单校验
      // 表单对象.validate()
      this.$refs.loginFormRef.validate(valid => {
        if (!valid) {
          return false
        }
        // 用户点击 表单域校验成功后,使用缓存中的极验对象
        if (this.ctaObj !== null) {
          return this.ctaObj.verify()
        }
        this.isActive = true // 登录按钮处于等待、禁用状态
        // A 人机验证
        this.$http({
          url: '/mp/v1_0/captchas/' + this.loginForm.mobile,
          method: 'get'
        })

          .then(result => {
            // 从result里边解构下述的data对象出来(对象结构赋值)
            let { data } = result.data
            // 请检测data的数据结构， 保证data.gt, data.challenge, data.success有值
            window.initGeetest({
              // 以下配置参数来自服务端 SDK
              gt: data.gt,
              challenge: data.challenge,
              offline: !data.success,
              new_captcha: true,
              product: 'bind' // 设置验证窗口的样式
            }, captchaObj => {
              // 这里可以调用验证实例 captchaObj 的实例方法
              captchaObj.onReady(() => {
                // 验证码ready之后才能调用verify方法显示验证码(可以显示窗口了)
                this.isActive = false // 恢复按钮
                this.ctaObj = captchaObj
                captchaObj.verify() // 显示验证码窗口
              }).onSuccess(() => {
                this.loginAct()
              }).onError(() => {
                // 行为校验错误的处理
              })
            })
          })
          .catch(err => {
            return this.$message.error('获取极验秘钥失败：' + err)
          })
      })
    },
    loginAct () {
      // 服务器验证登录信息
      let pro = this.$http({
        url: '/mp/v1_0/authorizations',
        method: 'POST',
        data: this.loginForm // 传递的数据,在loginForm中就有
      })
      pro
        .then(result => {
          console.log(result)

          // 浏览器把 服务端返回的秘钥等相关数据 通过 sessionStorage 做记录,表明登录状态
          window.sessionStorage.setItem(
            'userinfo',
            JSON.stringify(result.data.data)
          )

          // 路由编程式导航 name实现
          this.$router.push({ name: 'home' })
          // console.log(result)
        })
        .catch(err => {
          console.log('error' + err)
          this.$message.error('手机号或验证码错误!')
        })
    }
  }
}
</script>

<style lang="less" scoped>
.login-container {
  background-color: #ccc;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url("./2.jpg");
  background-size: cover;
  .login-box {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 410px;
    height: 340px;
    background-color: #fff;
    .el-form {
      width: 75%;
      text-align: center;
      img {
        width: 60%;
        margin: 20px auto;
      }
    }
  }
}
</style>
