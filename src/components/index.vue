<template>
    <div>
      <div class="choose_day">
        <span>选择开始日期：</span>
        <input type="text" @click="showpick(1)" readOnly='readOnly' v-model="startTime">
      </div>
      <div class="choose_day">
        <span>选择结束日期：</span>
        <input type="text" @click="showpick(2)" v-model="endTime" readOnly='readOnly'>
      </div>
      <div class="shaixuan">
        <span>类型筛选:</span>
        <van-dropdown-menu>
          <van-dropdown-item v-model="value1" :options="option1" />
        </van-dropdown-menu>
      </div>
      <div class="search">
        <van-button type="danger" @click="search">搜索</van-button>
      </div>
        <mescroll-vue ref="mescroll" :up="mescrollUp" @init="mescrollInit">
			    <ul class="list">
            <li id="noList"></li>
            <li v-for="(item, index) in dataList" :key="index" >
                <span>名称:{{item.remarks}}</span>
                <span>类型:{{item.logType}}</span>
                <span>金额:{{item.amount}}</span>
                <span>订单号:{{item.serial}}</span>
                <span>时间:{{item.createTime}}</span>
            </li>
          </ul>
			  </mescroll-vue>
      <van-popup v-model="show" position="bottom">
        <van-datetime-picker v-model="currentDate" type="date" @cancel='show=false' @confirm="confirm" :max-date="maxDate"/>
      </van-popup>
    </div>
</template>

<script>
import MescrollVue from 'mescroll.js/mescroll.vue'
import request from '@/libs/request.js'
import { DatetimePicker ,Popup ,DropdownMenu, DropdownItem ,Button,Toast } from 'vant';
  export default {
    components: {
        MescrollVue, // 注册mescroll组件
        'van-popup':Popup,
        'van-datetime-picker':DatetimePicker,
        'van-dropdown-menu':DropdownMenu,
        'van-dropdown-item':DropdownItem,
        'van-button':Button
      },
    created(){
      if (!window.localStorage.getItem('token')) {
        this.$router.push('/')
        return
      }
    },
    data () {
      return {
        start_timeStamp:'',
        value1: '',
        option1: [
          { text: '支付订单', value: 0 },
          { text: '退款订单', value: 1 },
          { text: '产品收益还款', value: 2 },
          { text: '账户充值', value: 3 },
          { text: '提现', value: 4 },
          { text: '手续费', value: 5 },
        ],
        show:false,
        mescroll: null, // mescroll实例对象
        mescrollUp: { // 上拉加载的配置.
          callback: this.upCallback, // 上拉回调,此处简写; 相当于 callback: function(page, mescroll) { }
          //以下是一些常用的配置,当然不写也可以的.
          empty: {
					//列表第一页无任何数据时,显示的空提示布局; 需配置warpId才显示
            warpId: "noList", //父布局的id (1.3.5版本支持传入dom元素)
            tip: "暂无相关数据~" //提示
          }
        },
        dataList: [], // 列表数据
        maxDate:new Date(),
        currentDate: new Date(),
        startTime:'',
        startTime_one:'',
        endTime:'',
        endTime_one:'',
        flag:0
      }
    },
    methods: {
      padLeftZero(str) {
        return ('00' + str).substr(str.length);
      },
      formatDate(tap, fmt){
        var tap = Number(tap)
        if (!tap) {
            return;
        }
        var date = new Date(tap);
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
        }
        let o = {
            'M+': date.getMonth() + 1,
            'd+': date.getDate(),
            'h+': date.getHours(),
            'm+': date.getMinutes(),
            's+': date.getSeconds()
        };
        for (let k in o) {
            if (new RegExp(`(${k})`).test(fmt)) {
                let str = o[k] + '';
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : this.padLeftZero(str));
            }
        }
        return fmt;
      },
      search(){
        Toast.loading({
          mask: true,
          message: '加载中...',
          duration: 0,  
        });
        this.mescroll.triggerDownScroll();
      },
      // mescroll组件初始化的回调,可获取到mescroll对象
      mescrollInit (mescroll) {
        this.mescroll = mescroll  // 如果this.mescroll对象没有使用到,则mescrollInit可以不用配置
      },
      // 上拉回调 page = {num:1, size:10}; num:当前页 ,默认从1开始; size:每页数据条数,默认10
      upCallback (page, mescroll) {
        // 联网请求
        request({
          url:'/auth/queryCapital',
          data:{
            curPage:page.num,
            pageSize:page.size,
            startTime:this.startTime_one,
            endTime:this.endTime_one,
            type:this.value1
          }
        })
        .then((data) => {
          Toast.clear()
          // 请求的列表数据
          let arr = data.result.capitalLogs
          // 如果是第一页需手动置空列表
          if (page.num === 1) this.dataList = []
          // 把请求到的数据添加到列表
          arr.forEach(item => {
            this.dataList.push({
              amount:item.amount,
              createTime:this.formatDate(item.createTime,'yyyy-MM-dd hh:mm'),
              logType:item.logType,
              remarks:item.remarks,
              serial:item.serial,
            })
          });
          // this.dataList = this.dataList.concat(arr)
          // 数据渲染成功后,隐藏下拉刷新的状态
          this.$nextTick(() => {
            mescroll.endSuccess(arr.length)
          })
        }).catch((e) => {
          // 联网失败的回调,隐藏下拉刷新和上拉加载的状态;
          mescroll.endErr()
        })
      },
      showpick(val){
        this.flag = val
        this.show = true
        if(val==1){
          this.endTime = ''
          this.endTime_one = ''
        }
      },
      confirm(value){
        let Y = value.getFullYear()
        let M = (value.getMonth()+1)<10?`0${value.getMonth()+1}`:value.getMonth()+1
        let D = value.getDate()<10?`0${value.getDate()}`:value.getDate()
        if(this.flag == 1){
          this.start_timeStamp = value.getTime()
          this.startTime = `${Y}-${M}-${D}`
          this.startTime_one = `${Y}${M}${D}`
        }
        if(this.flag == 2){
          let timeStamp = value.getTime()
          if(timeStamp<this.start_timeStamp){
            Toast({message:'结束时间必须大于开始时间',duration:1500})
            return
          }
          this.endTime = `${Y}-${M}-${D}`
          this.endTime_one = `${Y}${M}${D}`
        }
        this.show = false
      }
    }
		
  }
</script>

<style scoped>
.choose_day{
  padding: 10px;
  font-size: 16px;
}
.shaixuan{
  display: flex;
  padding-left: 10px;
  align-items: center;
}
.mescroll {
  position: fixed;
  top: 200px;
  bottom: 0;
  height: auto;
}
.mescroll>div>.list>li{
display: flex;
flex-flow: column;
justify-content: space-around;
border: 1px solid #000;
margin-bottom: 3px;
}
.mescroll>div>.list>li>span{
  padding: 5px;
  font-size: 18px;
}
#noList{
  border: none;
}
</style>