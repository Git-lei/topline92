<template>
  <div>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>发表文章</span>
      </div>
      <div class="text item">
        <el-form ref="addFormRef" :model="addForm" label-width="120px" :rules="addFormRules">
          <el-form-item label="标题: " prop="title">
            <el-input v-model="addForm.title"></el-input>
          </el-form-item>
          <el-form-item label="内容: " prop="content" v-model="addForm.content">
            <quillEditor v-model="addForm.content"></quillEditor>
          </el-form-item>
          <el-form-item label="封面: ">
            <el-radio v-model="addForm.cover.type" :label="1">单图</el-radio>
            <el-radio v-model="addForm.cover.type" :label="3">三图</el-radio>
            <el-radio v-model="addForm.cover.type" :label="0">无图</el-radio>
            <el-radio v-model="addForm.cover.type" :label="-1">自动</el-radio>
            <ul>
              <li class="uploadbox" v-for="item in covernum" :key="item" @click="showDialog(item)">
                <!-- 把遍历的item当做序号传递给事件方法，值是从1开始的，接收后要做-1减一操作 -->
                <span>点击图标选择图片</span>
                <img v-if="addForm.cover.images[item-1]" :src="addForm.cover.images[item-1]" alt />
                <div v-else class="el-icon-picture-outline"></div>
              </li>
            </ul>
          </el-form-item>
          <el-form-item label="频道: " prop="channel_id">
            <channel-com @slt="selectHandler"></channel-com>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="addarticle(false)">发布</el-button>

            <el-button @click="addarticle(true)">存草稿</el-button>
          </el-form-item>
        </el-form>

        <!-- dialog -->
        <el-dialog title="提示" :visible.sync="dialogVisible" width="60%" @close="clearimage">
          <el-tabs v-model="activeName" type="card">
            <el-tab-pane label="素材库" name="first">
              <!-- 素材图片列表展示 -->
              <ul>
                  <li class="image-box" v-for="item in imageList" :key="item.id">
                  <img :src="item.url" alt="没有图片" @click="clkImage" />
                  </li>
              </ul>
            </el-tab-pane>
            <el-tab-pane label="上传图片" name="second">
              <!--  -->
              <el-upload
                on-preview="handlePreview"
                action="http://ttapi.research.itcast.cn/mp/v1_0/user/images"
                :headers="setToken"
                name="image"
                :show-file-list="true"
                :on-success="onSuccess"
              >
                <el-button size="small" type="primary">点击上传</el-button>
              </el-upload>

              <!--  -->
            </el-tab-pane>
          </el-tabs>
          <span slot="footer" class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="imageok">确定</el-button>
          </span>
        </el-dialog>
      </div>
    </el-card>
  </div>
</template>

<script>
// 引入 公共频道组件
import ChannelCom from '@/components/channel.vue'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
// 通过es6按需导入方式 导入需要的组件模块

// 按需导入

import { quillEditor } from 'vue-quill-editor'
export default {
  components: {
    quillEditor,
    ChannelCom
  },
  computed: {
    covernum () {
      // 设计当前图片"选择框"个数
      if (this.addForm.cover.type > 0) {
        return this.addForm.cover.type
      }
      return 0
    },
    setToken () {
      let token = JSON.parse(window.sessionStorage.getItem('userinfo')).token
      return { Authorization: 'Bearer ' + token }
    }
  },
  name: 'ArticleAdd', // 配置子路由 的name
  data () {
    return {
      materialUrl: '', // 选中的素材图片的路径名地址信息
      xu: 0, // 记录被单击选择的素材图片

      activeName: 'first', // 默认激活标签
      imageList: [], // 素材图片列表
      querycdt: {
        // 获取素材图片的条件参数
        collect: false,
        page: 1,
        per_page: 12
      },

      dialogVisible: false, // 对话框是否显示
      channelList: [],
      channel_id: '',
      //

      addForm: {
        title: '',
        content: '',
        cover: {
          type: 0,
          images: []
        }

      },
      addFormRules: {
        // 名称 [{
        //        规则
        //    }]
        title: [
          { required: true, message: '标题必填' },
          { min: 5, max: 12, message: '标题不能少于5个字且不能超过12个字' }
        ],
        content: [
          {
            required: true,
            message: '不能为空'
          }
        ],
        channel_id: [
          {
            required: true,
            message: '请选一个'
          }
        ]
      }
    }
  },
  created () {
    this.getImageList() // 获得供选取的素材图片
  },
  methods: {
    // 选好素材图片后, 单击确定...记录素材图片
    imageok () {
      if (this.materialUrl) {
        this.dialogVisible = false
        this.addForm.cover.images[this.xu] = this.materialUrl
      } else {
        this.$message.error('请选择一个')
      }
    },

    // 制作一个methods 方法,清除之前选中的素材图片,,,,达到在选择其他图片样式(一图,三图,选择)的时候, 没有默认选中
    clearimage () {
      let lis = document.querySelectorAll('.image-box')
      for (var i = 0; i < lis.length; i++) {
        lis[i].style.border = ''
      }
      this.materialUrl = ''
    },

    onSuccess () {
      this.$message.success('图片上传成功！')
      this.getImageList() // 获得供选取的素材图片
    },
    // 获取图片列表
    getImageList () {
      let pro = this.$http({
        url: '/mp/v1_0/user/images',
        method: 'get',
        params: this.querycdt
      })
      pro
        .then(result => {
          console.log(result)
          // imageList接收素材图片
          this.imageList = result.data.data.results
        })
        .catch(err => {
          return this.$message.error('获得图片列表失败：' + err)
        })
    },
    clkImage (evt) {
      // 点击图片  选中 高亮
      let lis = document.querySelectorAll('.image-box')
      for (var i = 0; i < lis.length; i++) {
        lis[i].style.border = ''
      }
      this.clearimage()
      let nowli = evt.target.parentNode
      nowli.style.border = '5px solid skyblue'
      this.materialUrl = evt.target.src // 把当前选中图片的src地址信息赋予给meterialUrl成员
    },
    showDialog (n) {
      // 更新xu成员
      this.xu = n - 1
      // 显示 dialog
      this.dialogVisible = true
    },
    selectHandler (val) {
      // 子传父的值
      this.addForm.channel_id = val
    },
    addarticle (flag) {
      // 表单校验
      this.$refs.addFormRef.validate(valid => {
        if (valid) {
          var pro = this.$http.post('/mp/v1_0/articles', this.addForm, {
            params: { draft: flag }
          })
          pro
            .then(result => {
              this.$message.success('文章发布成功')
              this.$router.push({ name: 'articleList' })
            })
            .catch(err => {
              return this.$message.error('发布失败' + err)
            })
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.el-form /deep/ .ql-editor {
  // 深度作用选择器
  height: 200px;
}
// 对话框素材图片列表相关css样式
.image-box {
  list-style: none;
  width: 200px;
  height: 140px;
  background-color: #fff;
  margin: 10px;
  float: left;
  border: 1px solid #eee;
  cursor: pointer;
  box-sizing: border-box;
  img {
    width: 100%;
    height: 100%;
  }
}
// 文章封面选择框样式
.uploadbox {
  list-style: none;
  width: 200px;
  height: 200px;
  margin: 10px;
  float: left;
  cursor: pointer;
  border: 1px solid #eee;
  span {
    width: 200px;
    height: 50px;
    line-height: 50px;
    display: block;
    text-align: center;
  }
  div {
    width: 200px;
    height: 150px;
    font-size: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #fff;
  }
  img {
    width: 200px;
    height: 150px;
  }
}
</style>
