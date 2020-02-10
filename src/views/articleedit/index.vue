<template>
  <div>
      <el-card class="box-card">
          <div slot="header" class="clearfix">
              <span>编辑文章</span>
          </div>
          <div class="text item">
              <el-form ref="editFormRef" :model="editForm" label-width="120px" :rules="editFormRules">
                <el-form-item label="标题: " prop="title"><el-input  v-model="editForm.title"></el-input></el-form-item>
                <el-form-item label="内容: " prop="content" v-model="editForm.content">

                        <quillEditor v-model="editForm.content"></quillEditor>

                </el-form-item>
                <el-form-item label="封面: ">
                <el-radio-group v-model="editForm.cover.type">
                    <el-radio :label="1">单图</el-radio>
                    <el-radio :label="3">三图</el-radio>
                    <el-radio :label="0">无图</el-radio>
                    <el-radio :label="-1">自动</el-radio>
                </el-radio-group>
                </el-form-item>
                <el-form-item label="频道: " prop="channel_id">
                           <!-- 使用 单组件 -->
                  <channel-com @slt='selectHandler'></channel-com>
                </el-form-item>
                <el-form-item>
                  <el-button type='primary' @click="editarticle(false)">修改</el-button>

                  <el-button  @click="editarticle(true)">存草稿</el-button>
                </el-form-item>
              </el-form>
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
  computed: {
    aid () {
      return this.$route.params.aid
    }
  },
  components: {
    quillEditor,
    ChannelCom
  },

  name: 'ArticleEdit', // 配置子路由 的name
  data () {
    return {
      channelList: [],
      editForm: {
        title: '',
        content: '',
        cover: {
          type: 0,
          images: []
        },
        channel_id: ''
      },
      editFormRules: {
        // 名称 [{
        //        规则
        //    }]
        title: [
          { required: true, message: '标题必填' },
          { min: 5, max: 12, message: '标题不能少于5个字且不能超过12个字' }
        ],
        content: [{
          required: true,
          message: '不能为空'
        }],
        channel_id: [{
          required: true,
          message: '请选一个'
        }]
      }
    }
  },
  created () {
    this.getArticleByAid()
  },
  methods: {
    // 通过aid 在修改文章页面,显示被修改的 内容
    getArticleByAid () {
      let pro = this.$http.get(`/mp/v1_0/articles/${this.aid}`)
      pro
        .then(result => {
          if (result.data.message === 'OK') {
            this.editForm = result.data.data
          }
        })
        .catch(err => {
          return this.$message.error('获取失败' + err)
        })
    },
    selectHandler (val) {
      this.editForm.channel_id = val
    },
    editarticle (flag) {
      // 表单校验
      // 修改文章
      // flag=true  是存入草稿
      // flag=false  正式发布
      this.$refs.editFormRef.validate(valid => {
        if (valid) {
          var pro = this.$http.post('/mp/v1_0/articles', this.editForm, {
            params: { draft: flag }
          })
          pro
            .then(result => {
              this.$message.success('文章修改成功')
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
.el-form /deep/ .ql-editor {// 深度作用选择器
    height: 200px;
}
</style>
