<template>
  <div class="login">
    <div class="phone">
      <input type="number" placeholder="手机号" v-model="phone">
    </div>
    <div class="code">
      <input type="number" placeholder="验证码" v-model="code">
      <van-button type="danger" round @click="getCode" :loading="loading_code" :disabled="codeDisabled">{{codeMsg}}</van-button>
    </div>
    <div class="submit">
      <van-button type="danger" round :loading="loading_submit" @click="submit">登录</van-button>
    </div>
  </div>
</template>

<script>
import { Button ,Notify  } from 'vant';
import request from '@/libs/request.js'
export default {
  name: 'login',
  components:{
    'van-button':Button
  },
  data () {
    return {
      phone:'',
      code:'',
      // 是否禁用按钮
      codeDisabled: false,
      // 倒计时秒数
      countdown: 60,
      // 按钮上的文字
      codeMsg: '获取验证码',
      // 定时器
      timer: null,
      loading_code:false,
      loading_submit:false
    }
  },
  methods:{
    testPhone() {
      const bo = !(/^1[345789]\d{9}$/.test(this.phone))
      this.phoneErr = bo
      console.log(this.phoneErr)
      return bo
    },
    testCode() {
      const bo = !(/^\d{6}$/.test(this.code))
      this.codeErr = bo
      return bo
    },
    // 获取验证码
    getCode() {
      if (this.testPhone()) {
        Notify({
          message: '请输入正确手机号',
          duration: 2000
        });
        return
      }
      this.loading_code = true
       request({
          url: '/security/sendCode',
          data: {phone:this.phone}
        })
        .then( data => {
          this.loading_code = false
          if(data.success){
            if (!this.timer) {
              this.timer = setInterval(() => {
                if (this.countdown > 0 && this.countdown <= 60) {
                  this.codeDisabled = true
                  this.countdown--;
                  if (this.countdown !== 0) {
                    this.codeMsg = "重新发送(" + this.countdown + ")";
                  } else {
                    clearInterval(this.timer);
                    this.codeMsg = "获取验证码";
                    this.countdown = 60;
                    this.timer = null;
                    this.codeDisabled = false;
                  }
                }
              }, 1000)
            }
          }else{
            Notify({
              message: data.errorDescription||'系统繁忙',
              duration: 2000
            });
          }
        })
        .catch( () => {
          this.loading_code = false
          Notify({
            message: data.errorDescription||'系统繁忙',
            duration: 2000
          });
        })
    },
    submit(){
      window.localStorage.setItem('token', 'b6e2465e-7162-4628-b7e3-8735f28af416')
      if (this.testPhone() || this.testCode()) {
        Notify({
          message: '请输入手机号或验证码',
          duration: 2000
        });
        return
      }
      this.loading_submit = true;
      request({url:'/security/login',data: {phone:this.phone,code:this.code}})
      .then( data => {
        this.loading_submit = false;
        if (data.success && data.result) {
          window.localStorage.setItem('token', data.result)
          this.$router.push('/index')
        }else{
          Notify({
              message: data.errorDescription||'系统繁忙',
              duration: 2000
            });
        }
      })
      .catch( () => {
        this.loading_submit = false;
        Notify({
            message: data.errorDescription||'系统繁忙',
            duration: 2000
          });
      })
    }
  },
  mounted(){
    if (window.localStorage.getItem('token')) {
      this.$router.push('/index')
    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.login{
  min-height: 100vh;
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  padding: 0 50px;
}
.phone{
  width: 100%;
}
.phone>input{
  width: 100%;
  height: 44px;
  border-radius: 44px;
  margin: 0 0 20px 0;
  border: 1px solid #000;
  text-align: center;
  font-size: 14px;
}
.code{
  width: 100%;
  display: flex;
  justify-content: space-between;
}
.code>input{
  font-size: 14px;
  width: 50%;
  text-align: center;
  border-radius:44px;
  border: 1px solid #000;
}
.code>button{
  width: 113px;
}
.submit{
  margin-top: 20px;
  width: 100%;
}
.submit>button{
  width: 100%;
}
</style>
