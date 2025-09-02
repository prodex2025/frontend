// ログイン画面・新規登録画面で使うinput
// CSSファイルを適応
import styles from '@/styles/approvals.module.css';

// 名前・ID・URL等は引数で渡す
export default function ApprovalsInput({type,name,id,text,value,onChange}){

  if(value==null || value==""){
    value="";
  }

  return(
    <div className={styles.inputContent}>
      <input className={styles.content} type={type} name={name} id={id} placeholder='' defaultValue={value} onChange={onChange} required/>
      <label htmlFor={id}>{text}</label>
    </div>
  );
}