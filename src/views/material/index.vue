<template>
  <!--卡片区-->
  <el-card class="box-card">
    <!--命名插槽，头部内容设置-->
    <div slot="header" class="clearfix">
      <span>素材管理</span>
      <!--
        默认上传动作
        1. action设置地址
        2. 需要传递token信息，通过headers属性设置
        3. 通过name属性设置被上传图片的传递名字,服务器端要求是image
        4. :show-file-list="false" 禁止形成列表效果
        5. on-success 文件上传成功后回调处理
      -->
      <el-upload
            style="float: right; padding: 3px 0"
            action="http://ttapi.research.itcast.cn/mp/v1_0/user/images"
            :headers="setToken"
            name="image"
            :snow-file-list='false'
            :on-success="onSuccess"
            >
          <el-button size="small" type="primary">点击上传</el-button>
        </el-upload>
    </div>
    <!--匿名插槽，卡片主体内容-->
    <div class="text item">
      <ul>
        <li class="image-box" v-for="item in imageList" :key="item.id">
          <img :src="item.url" alt>
          <div class="image-bot">
            <el-button type="success" icon="el-icon-star-off" circle></el-button>
            <el-button type="danger" icon="el-icon-delete" circle></el-button>
          </div>
        </li>
      </ul>
    </div>
  </el-card>
</template>

<script>
export default {
  name: 'material',
  data () {
    return {
      // 创建data成员imageList，接收获取的图片列表信息
      imageList: [],
      // 创建data成员querycdt，设置获取图片列表的条件(collect:false/page:1/per_page:20)
      querycdt: {
        collect: false,
        page: 1,
        per_page: 20
      }
    }
  },
  computed: {
    setToken () {
      // 在computed计算属性中给上传ajax设置token
      let token =
      JSON.parse(window.sessionStorage.getItem('userinfo')).token
      return { Authorization: 'Bearer ' + token }
    }
  },
  created () {
    this.getImageList()
  },
  methods: {
    // 素材上传完毕的回调处理
    onSuccess () {
      this.$message.success('图片上传成功！')
      this.getImageList() // 刷新图片
    },
    getImageList () {
      this.$http.get(
        '/mp/v1_0//user/images',
        { params: this.querycdt })
        .then(result => {
          if (result.data.message === 'OK') {
            this.imageList = result.data.data.results
          }
        })
        .catch(err => {
          return this.$message.error('获取失败' + err)
        })
    }
  }
}
</script>

<style lang="less" scoped>
// 素材图片列表样式
.image-box {
  list-style: none;
  width: 200px;
  height: 200px;
  background-color: #fff;
  margin: 10px;
  float: left;
  border: 1px solid #eee;
  img {
    width: 200px;
    height: 140px;
  }
  .image-bot {
    width: 200px;
    height: 60px;
    line-height: 60px;
    text-align: center;
  }
}
</style>
