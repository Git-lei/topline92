<template>
  <div class="asd">
    <el-card  class="box-card">
      <div slot="header" class="clearfix">
        <span>全部图文</span>
      </div>
      <div class="text item">
      <el-form ref="searchFormRef" :model="searchForm" label-width="100px">
        <el-form-item label="文章状态:">
          <el-radio v-model="searchForm.status" label="">全部</el-radio>
          <el-radio v-model="searchForm.status" :label=" 0 ">草稿</el-radio>
          <el-radio v-model="searchForm.status" :label=" 1 ">待审核</el-radio>
          <el-radio v-model="searchForm.status" :label=" 2 ">审核通过</el-radio>
          <el-radio v-model="searchForm.status" :label=" 3 ">审核失败</el-radio>
          <el-radio v-model="searchForm.status" :label=" 4 ">已删除</el-radio>
        </el-form-item>
        <el-form-item label="频道列表:">
         <!-- 使用 单组件 -->
         <channel-com @slt='selectHandler'></channel-com>
        </el-form-item>
        <el-form-item label="时间选择:">.
          <el-date-picker
          v-model="timetotime"
          type="daterange"
          range-separator='至'
          start-placeholde="开始日期"
          end-placeholde="结束日期"
          value-format="yyyy-MM-dd"
          >
          </el-date-picker>
        </el-form-item>
      </el-form>
      </div>
    </el-card>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
          <span>共找到{{total}}条符合条件的文章</span>
      </div>
      <el-table :data="articleList" style="width:100%">
        <el-table-column prop="cover.images[0]" label="图标">
          <img slot-scope="sData"
            :src="sData.row.cover.images[0]"
            alt=""
            width="150px" height="100px"
          >
        </el-table-column>
        <el-table-column prop="title" label="标题"></el-table-column>
        <el-table-column prop="status" label="状态">
          <!-- 因为 每个el-tag 标签都需要,接收数据,我为了减少代码量,可以提供一个父级的template标签,统一使用为作用域插槽 -->
          <template slot-scope="sData">
              <el-tag v-if="sData.row.status===0">草稿</el-tag>
              <el-tag v-if="sData.row.status===1" type="info">待审核</el-tag>
              <el-tag v-if="sData.row.status===2" type="success">审核通过</el-tag>
              <el-tag v-if="sData.row.status===3" type="warning">审核失败</el-tag>
          </template>

        </el-table-column>
        <el-table-column prop="pubdate" label="发布时间"></el-table-column>
        <el-table-column label='操作' >
          <template slot-scope="sData">
            <el-button type="primary" size="mini" @click="$router.push(`/articleedit/${sData.row.id}`)">编辑</el-button>
            <el-button type="danger" size="mini"  @click="delarticle(sData.row.id)">删除</el-button>
          </template>

        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="searchForm.page"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="searchForm.per_page"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      <!-- 以上 current-page、page-size、total 的值来自**data**声明的 -->
      <!-- @size-change和@current-change 需要在**methods**中声明空方法 -->
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
// 引入 公共频道组件
import ChannelCom from '@/components/channel.vue'
export default {
  components: {

    ChannelCom
  },
  created () {
    // this.getChannelList()
    this.getArticleList()
  },
  methods: {
    selectHandler (val) {
      this.searchForm.channel_id = val
    },
    // getChannelList () {
    //   this.$http.get('/mp/v1_0/channels').then(result => {
    //     console.log(result)
    //     if (result.data.message === 'OK') {
    //       console.log(result)
    //       this.channelList = result.data.data.channels
    //     }
    //   }).catch(err => {
    //     return this.$message.error('错误:' + err)
    //   })
    // },
    // 删除文章
    delarticle (id) {
      this.$confirm('确认要删除该数据么?', '删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let pro = this.$http.delete('/mp/v1_0/articles/' + id)
        pro
          .then(result => {
            this.$message.success('文章删除成功!')
            // 更新文章列表
            this.getArticleList()
          })
          .catch(err => {
            return this.$message.error('删除文章错误：' + err)
          })
      }).catch(() => { })
    },
    // 获得真实文章列表数据
    getArticleList () {
      let searchData = {}
      for (var i in this.searchForm) {
        if (this.searchForm[i] || this.searchForm[i] === 0) {
          // 把searchForm内部为空的成员都"过滤掉"
          searchData[i] = this.searchForm[i]
        }
      }
      this.$http.get('/mp/v1_0/articles', { params: searchData }).then(result => {
        console.log(result)
        // 接收数据
        this.articleList = result.data.data.results
        this.total = result.data.data.total_count// 总记录条数
      }).catch(err => {
        return this.$message.error('获取失败:' + err)
      })
    },

    // 每页显示的条数
    handleSizeChange (val) {
      this.searchForm.per_page = val
      // this.getArticleList()
    },

    // 页码变化,,的回调函数
    handleCurrentChange (val) {
      this.searchForm.page = val
      // this.getArticleList()
    }
  },
  name: 'articleList',
  data () {
    return {
      articleList: [],
      total: 0,
      timetotime: [],
      channelList: [],
      searchForm: {
        page: 1,
        per_page: 10,
        status: '',
        id: '',
        channel_id: '',
        begin_pubdate: '', // 文章发布开始时间
        end_pubdate: '' // 文章发布结束时间

      }
    }
  },
  watch: {
    searchForm: {
      handler (newV, oldV) {
        this.getArticleList()
        // this.getChannelList()
      },
      deep: true// 深度监听
    },

    timetotime (newV) {
      if (newV) {
        this.searchForm.begin_pubdate = newV[0]
        this.searchForm.end_pubdate = newV[1]
      }
    }
  }
}
</script>

<style lang="less" scoped>
/**/
  .el-pagination {
    display: flex;
    justify-content: center
  }

 .box-card{margin-bottom:15px;}
</style>
