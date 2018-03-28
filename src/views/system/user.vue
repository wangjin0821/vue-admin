<template>
  <div>
    <imp-panel>
        <h3 class="box-title" slot="header" style="width: 100%;">
          <el-row style="width: 100%;">
            <el-col :span="12">
                <el-button type="primary" icon="plus" @click="add">新增</el-button>
              <!-- <router-link :to="{ path: 'userAdd'}">
                
              </router-link> -->
            </el-col>
            <el-col :span="12">
              <div class="el-input" style="width: 200px; float: right;">
                <i class="el-input__icon el-icon-search"></i>
                <input type="text" placeholder="输入用户名称" v-model="searchKey" @keyup.enter="search($event)"
                        class="el-input__inner">
              </div>
            </el-col>
          </el-row>
        </h3>
        <div slot="body" v-loading="listLoading">
          <el-table
            :data="tableData.rows"
            border
            style="width: 100%"
            @selection-change="handleSelectionChange">
            <!--checkbox 适当加宽，否则IE下面有省略号 https://github.com/ElemeFE/element/issues/1563-->
            <el-table-column
              prop="id"
              type="selection"
              width="50">
            </el-table-column>
            <el-table-column
              label="照片" width="76">
              <template slot-scope="scope">
                <img :src='scope.row.avatar' style="height: 35px;vertical-align: middle;" alt="">
              </template>
            </el-table-column>
            <el-table-column
              prop="name"
              label="名称">
            </el-table-column>
            <el-table-column
              prop="userName"
              label="登录用户名">
            </el-table-column>
            <el-table-column
              prop="passWord"
              label="登录密码">
            </el-table-column>
            <el-table-column
              prop="email"
              label="邮箱">
            </el-table-column>
            <el-table-column
              label="状态">
              <template slot-scope="scope">
                {{ scope.row.status===1 ? '已激活' : '未激活' }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="285">
              <template slot-scope="scope">
                <el-button
                  size="small"
                  type="default"
                  icon="edit"
                  @click="handleEdit(scope.$index, scope.row)">编辑
                </el-button>
                <el-button
                  size="small"
                  type="info"
                  icon="setting"
                  @click="handleRoleConfig(scope.$index, scope.row)">配置角色
                </el-button>
                <el-button
                  size="small"
                  type="danger"
                  @click="handleDelete(scope.$index, scope.row)">删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
    
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="tableData.pagination.pageNo"
            :page-sizes="[5, 10, 20]"
            :page-size="tableData.pagination.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="tableData.pagination.total">
          </el-pagination>
        </div>
      </imp-panel>
      <el-dialog title="配置用户角色" :visible.sync="dialogVisible" size="tiny">
        <div class="select-tree">
          <el-scrollbar
            tag="div"
            class='is-empty'
            wrap-class="el-select-dropdown__wrap"
            view-class="el-select-dropdown__list">
            <el-tree
              ref="roleTree"
              :data="roleTree"
              show-checkbox
              check-strictly
              node-key="id" v-loading="dialogLoading"
              :props="defaultProps">
            </el-tree>
          </el-scrollbar>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="configUserRoles">确 定</el-button>
          </span>
      </el-dialog>
      <el-dialog title="外层 Dialog" :visible.sync="outerVisible">
        fsdafasdfsaddfa
        <div slot="footer" class="dialog-footer">
          <el-button @click="outerVisible = false">取 消</el-button>
          <el-button type="primary" @click="innerVisible = true">打开内层 Dialog</el-button>
        </div>
      </el-dialog>
  </div>
</template>

<script>
import panel from '@/components/Panel'
import { getUserList, deleteUser, updateUserRole, getUserRoles, getRoleList } from '@/api/system'

export default {
  components: {
    'imp-panel': panel
  },
  data() {
    return {
      currentRow: {},
      dialogVisible: false,
      dialogLoading: false,
      outerVisible: false,
      defaultProps: {
        children: 'children',
        label: 'name',
        id: 'id'
      },
      roleTree: [],
      listLoading: false,
      searchKey: '',
      tableData: {
        pagination: {
          total: 0,
          pageNo: 1,
          pageSize: 10,
          parentId: 0
        },
        rows: []
      }
    }
  },
  methods: {
    add() {
      this.outerVisible = true
    },
    search(target) {
      this.loadData()
    },
    handleSelectionChange(val) {
      console.log(val)
    },
    handleRoleConfig(index, row) {
      this.currentRow = row
      this.dialogVisible = true
      if (this.roleTree.length <= 0) {
        this.dialogLoading = true
        getRoleList().then(res => {
          this.dialogLoading = false
          this.roleTree = res.data.list
        })
      }
      getUserRoles({ userId: row.id }).then(res => {
        this.$refs.roleTree.setCheckedKeys(res.data.list)
      }).catch(error => {
        this.$message.error(error)
      })
    },
    configUserRoles() {
        const checkedKeys = this.$refs.roleTree.getCheckedKeys()
        updateUserRole({ userId: this.currentRow.id, roleIds: checkedKeys }).then(res => {
          this.dialogVisible = false
          if (res.data.status) {
            this.$message(res.data.message)
          } else {
            reject(res.data.message)
          }
        }).catch(error => {
          this.$message.error(error)
        })
    },
    handleSizeChange(val) {
      this.tableData.pagination.pageSize = val
      this.loadData()
    },
    handleCurrentChange(val) {
      this.tableData.pagination.pageNo = val
      this.loadData()
    },
    handleEdit(index, row) {
      this.$router.push({
        path: 'userAdd', query: {
          id: row.id
        }
      })
    },
    handleDelete(index, row) {
      deleteUser({ userIds: [row.id] }).then(res => {
        if (res.data.status) {
          this.$message(res.data.message)
          this.loadData()
        } else {
          reject(res.data.message)
        }
      }).catch(error => {
        this.$message.error(error)
      })
    },
    loadData() {
      this.listLoading = true
      getUserList({
        key: this.searchKey,
        pageSize: this.tableData.pagination.pageSize,
        pageNo: this.tableData.pagination.pageNo
      }).then(res => {
        this.listLoading = false
        this.tableData.rows = res.data.userList
        this.tableData.pagination.total = res.data.total
      }).catch(error => {
        this.listLoading = false
        this.$message.error(error)
      })
    }
  },
  created() {
    this.loadData()
  }
}
</script>
<style>
  .el-pagination {
    float: right;
    margin-top: 15px;
  }
</style>
  