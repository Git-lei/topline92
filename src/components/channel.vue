<template>
<!-- **el-select组件**、 -->
  <el-select v-model="nowid " placeholder="请选择" clearable>
            <el-option
              v-for="item in channelList"
              :key="item.id"
              :label="item.name"
              :value="item.id">
              </el-option>
          </el-select>
</template>

<script>
export default {
  name: 'ChannelCom',

  // **props**[cid]、**watch**监听器[cid、nowid]
  props: {
    // 接收父给子传递的频道信息
    cid: {
      default: 0
    }
  },
  watch: {
    // 对cid做监听，使得cid的信息被赋予给nowid使用
    cid: function (newV, oldV) {
      this.nowid = newV
    },
    // 对nowid做监听
    nowid: function (newV, oldV) {
      // 当前子组件拥有名称为slt的事件(是父组件给声明的)

      // 对nowid做监听(watch/change)，有变化，就调用slt事件，并把chid传递给父组件

      this.$emit('slt', this.nowid)
    }

  },
  data () {
    // data成员(**chid**、**channelList**)、
    return {
      nowid: '', // 记录当前选中的频道信息
      channelList: []// 频道列表
    }
  },

  //* *getChannelList()方法**、**created**、
  created () {
    // 获得频道列表
    this.getChannelList()
  },
  methods: {
    // 获得频道
    getChannelList () {
      this.$http.get('/mp/v1_0/channels').then(result => {
        // console.log(result)
        if (result.data.message === 'OK') {
          // console.log(result)
          this.channelList = result.data.data.channels
        }
      }).catch(err => {
        return this.$message.error('错误:' + err)
      })
    }
  }
}
</script>

<style lang="less" scoped>
</style>
