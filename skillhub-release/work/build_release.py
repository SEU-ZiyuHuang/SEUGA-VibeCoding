from pathlib import Path
import re, json, hashlib, os

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT / 'skillhub-release'
OUT = BASE / 'seu-campus-guide'
WORK = BASE / 'work'
DATE = '2026-09-05'
OLD = ROOT / 'SEUCampusGuidance/原校区指南-wiki'
NEW = ROOT / 'seu-campus-guide/references'
NAMES = dict(sipailou='四牌楼', jiulonghu='九龙湖', dingjiaqiao='丁家桥', jiangbei='江北', suzhou='苏州', wuxi='无锡')
VERSIONS = dict(sipailou='2026.08 图片核对版', jiulonghu='2025.09 版', dingjiaqiao='25版', jiangbei='2025 版＋2026来源补充', suzhou='2025 版', wuxi='2025 版')
changes=[]
def sha(b): return hashlib.sha256(b).hexdigest()
def put(rel, text):
    p=OUT/rel; p.parent.mkdir(parents=True,exist_ok=True); p.write_text(text.strip()+'\n')
def log(src, dest, action, reason):
    changes.append(dict(source=str(src), destination=dest, action=action, reason=reason))
def meta_body(p):
    s=p.read_text(); m=re.match(r'^---\n(.*?)\n---\n',s,re.S); meta={}
    if m:
        for line in m[1].splitlines():
            if ':' not in line:continue
            k,v=line.split(':',1)
            try:meta[k]=json.loads(v.strip())
            except:meta[k]=v.strip()
        return meta,s[m.end():].strip()
    return {},s
def link(from_rel,to_rel,label):
    return '['+label+']('+os.path.relpath(to_rel,Path(from_rel).parent)+')'
def page(rel,title,body,scope,source,status='资料整理；未全面实时核验'):
    put(rel,f'# {title}\n\n> 适用范围：{scope}。\n> 来源：{source}。\n> 状态：{status}；整理日期：{DATE}。\n\n'+body+'\n\n'+link(rel,'references/index.md','返回主题索引'))
def new_sections(name):
    t=(NEW/name).read_text()
    return [(m.group(1),m.group(0).strip()) for m in re.finditer(r'^## ([^\n]+)\n(?:(?!^## ).)*',t,re.M|re.S)]

WORK.mkdir(parents=True,exist_ok=True)
inputs=[]
for folder in ['2026四牌楼','seu-campus-guide','SEUCampusGuidance']:
    for p in (ROOT/folder).rglob('*'):
        if p.is_file() and not any(x in p.parts for x in ['node_modules','.git','.vercel']):
            inputs.append({'path':str(p.relative_to(ROOT)),'sha256':sha(p.read_bytes())})
snapshot=WORK/'input-hashes.json'
if not snapshot.exists():snapshot.write_text(json.dumps(inputs,ensure_ascii=False,indent=2))

# Five campuses retain source-era factual paragraphs; updated subjects route to one maintained page.
replace_subsections={
 'jiulonghu/library-and-eae-centre.md': {'3.1':'../../common/library-hours.md','3.4':'../../common/library-services.md'},
 'dingjiaqiao/library-and-study.md': {'2.1':'../../common/library-hours.md','2.2':'../../common/library-services.md','2.3':'../../common/library-services.md'},
 'dingjiaqiao/campus-card-services.md': {'3.1':'../../common/campus-card.md','3.2':'../../common/campus-card.md'},
}
old_mapping={}
for p in sorted(OLD.glob('*/*.md')):
    campus=p.parent.name
    if p.name=='_campus.md':continue
    rel='references/campuses/'+campus+'/'+p.name
    old_mapping[str(p.relative_to(OLD))]=rel
    if campus=='sipailou':
        log(p.relative_to(ROOT),rel,'replace','按2026图片与重点官方核验重组；历史独有建筑等信息由结构化实体保留')
        continue
    meta,body=meta_body(p)
    for number,target in replace_subsections.get(campus+'/'+p.name,{}).items():
        pattern=r'^### '+re.escape(number)+r'[^\n]*\n(?:(?!^### ).)*'
        m=re.search(pattern,body,re.M|re.S)
        if m:
            heading=m[0].splitlines()[0]
            body=body[:m.start()]+heading+'\n\n本项已合并至[对应专题]('+target+')，请读取该页的适用范围与来源。\n\n'+body[m.end():]
            log(str(p.relative_to(ROOT))+'#'+number,rel,'replace','重复事实改为共同主题引用；旧文原样保留在输入目录')
    if campus=='jiulonghu' and p.name=='administrative-services.md':
        body='校级部门的位置、电话和职责已集中到[部门与办事目录](../../official/index.md)。按具体事项与校区读取，避免混用同一部门的不同窗口。'
    if campus=='jiangbei' and p.name in ['dormitory-and-access.md','canteens-and-payment.md','parcel-delivery-and-post.md']:
        log(p.relative_to(ROOT),rel,'replace','与新包江北对应主题按小节合并，正文在后续阶段生成')
        continue
    pre='> 本页保留原指南版本，属于历史参考；未在本次逐条核验，不表示当前营业、收费、门禁或班次。\n\n'
    if 'shuttle' in p.name:
        pre+='> 当前班次不可由本页推算；先看[接驳车核验说明](../../common/shuttle-status.md)。\n\n'
    if p.name=='canteens-and-medical.md':
        pre+='> 供餐时段已发现官方来源差异，请结合[食堂核验说明](../../common/dining-status.md)；紧急联系按[安全求助](../../common/safety.md)。\n\n'
    if p.name=='dormitories-on-campus.md':
        pre+='> 床铺规格随楼栋与入住批次不同，旧指南估计值不可作为统一采购尺寸；以分配楼栋确认。\n\n'
    if 'medical' in p.name or 'safety' in p.name or 'hospital' in p.name:
        pre+='> 危急情况先联系急救或现场人员，不等待历史门诊时间；南京医保政策见[医保专题](../../common/insurance.md)。\n\n'
    keywords='、'.join(meta.get('keywords',[]))
    aliases='；'.join(x.get('spoken','')+' → '+x.get('written','') for x in meta.get('alias_pairs',[]))
    related='\n'.join('- '+link(rel,'references/campuses/'+x+'.md',x) for x in meta.get('related',[]))
    body=pre+body+'\n\n## 查找线索\n\n关键词：'+keywords+'\n\n口语别名：'+(aliases or '无额外别名')
    if related:body+='\n\n## 相关主题\n\n'+related
    page(rel,meta.get('title',p.stem),body,NAMES[campus]+'；具体服务以正文人群为准',VERSIONS[campus]+'《新生实用信息简明指南》；源图 '+', '.join(meta.get('pages',[])))
    log(p.relative_to(ROOT),rel,'retain-adapt','保留原文主体、页码与别名；增加历史边界，必要处定向去重')

# Human-readable exports of existing structured entities. No runtime JSON required.
kb=ROOT/'SEUCampusGuidance/knowledge-base'
sources={x['id']:x for x in json.loads((kb/'sources.json').read_text())}
def source_lines(ids):
    result=[]
    for ident in ids:
        s=sources.get(ident,{})
        result.append('- ['+s.get('title',ident)+']('+s.get('url','https://www.seu.edu.cn/')+')；发布方：'+s.get('publisher','未记录')+'；原库核验日期：'+s.get('verifiedAt','未记录')+'；范围：'+s.get('scope','见原页面'))
    return '\n'.join(result)
labels={'location':'位置','summary':'简介','description':'说明','currentUse':'用途','heritage':'历史价值','hours':'开放安排','phones':'电话','onlineUrl':'线上入口','materials':'准备材料','steps':'办理步骤','notice':'提示','responsibilities':'职责','website':'网站','serviceNote':'服务说明','room':'房间','audience':'服务对象'}
def field(k,v):
    if not v:return ''
    if isinstance(v,list):return '\n## '+labels.get(k,k)+'\n\n'+'\n'.join('- '+str(t) for t in v)+'\n'
    return '\n**'+labels.get(k,k)+'**：'+str(v)+'\n'
official=[]
for fn,kind in [('places/sipailou.json','place'),('departments.json','department'),('services/sipailou.json','service')]:
    for record in json.loads((kb/fn).read_text()):
        rel='references/official/'+kind+'-'+record['id']+'.md'
        title=record.get('name',record.get('title',record['id']))
        body='条目 ID：`'+record['id']+'`\n\n别名：'+'、'.join(record.get('aliases',[]))+'\n'
        for k in labels:
            # finance and library opening facts have a dedicated updated page.
            if kind=='department' and record['id']=='finance-office' and k=='location':continue
            body+=field(k,record.get(k))
        if record.get('history'):
            body+='\n## 沿革\n\n'+'\n'.join('- '+str(h['year'])+'：'+h['text'] for h in record['history'])+'\n'
        if kind=='department':
            if record['id']=='finance-office':
                body+='\n## 办事窗口\n\n原库四牌楼地点与2026指南存在差异。本页不保留旧窗口指引，请查[财务办理核验](../campuses/sipailou/administrative-services.md)。\n'
            else:
                body+='\n## 分校区办公室\n'
                for office in record.get('offices',[]):
                    body+='\n### '+NAMES.get(office.get('campusId',''),office.get('campusId','未标校区'))+'\n'
                    for k in ['location','room','phones','serviceNote']:
                        if record['id']=='library-department' and k=='serviceNote':continue
                        body+=field(k,office.get(k))
                if record['id']=='library-department':body+='\n开放时间统一见[图书馆时段](../common/library-hours.md)。\n'
                # Business numbers live here; the emergency answer has one maintained page.
                if record['id']=='security-office':body+='\n本页为户籍等业务联系；紧急求助口径统一见[安全求助](../common/safety.md)，其中记录了与旧通知的号码差异。\n'
                if record['id']=='information-center':body+='\n校园网与应用问题的使用说明见[校园网](../common/network.md)、[数智东南](../common/digital-app.md)，校园卡见[校园卡](../common/campus-card.md)。\n'
        if record.get('placeId'):body+='\n关联地点：'+link(rel,'references/official/place-'+record['placeId']+'.md',record['placeId'])+'\n'
        if record.get('serviceIds'):body+='\n相关服务：'+'、'.join(link(rel,'references/official/service-'+s+'.md',s) for s in record['serviceIds'])+'\n'
        body+='\n## 原始来源\n\n'+source_lines(record.get('sourceIds',[]))
        page(rel,title,body,NAMES.get(record.get('campusId',''),'各办公室标注的校区'),fn+'；原库版本2026.08-campus-3','沿用原库核验记录，本次仅转换为可读文本；未重新确认所有事实')
        official.append((rel,title,kind));log('SEUCampusGuidance/knowledge-base/'+fn+'#'+record['id'],rel,'export','保留稳定ID、来源链接和原核验日期；不将转换日期当核验日期')

# Manual, source-aware release content and image extraction.
CONTENT = WORK/'curated.json'
manual=json.loads(CONTENT.read_text()) if CONTENT.exists() else {}
for rel,item in manual.items():
    page(rel,item['title'],item['body'],item['scope'],item['source'],item.get('status','来源摘编；具体以服务方当期通知为准'))

# Select useful supplemental sections; all omitted input sections receive an explicit audit decision.
selection={
 '11-校园卡与信息化.md': {'二、校园网（SEU-WLAN）':'references/common/network.md','三、数智东南 App':'references/common/digital-app.md'},
 '09-图书馆与实验室.md': {'二、借阅规则（2026 修订）':'references/common/library-services.md','三、跨校区委托借还':'references/common/library-services.md','五、李文正图书馆"找座"攻略（含电源）':'references/campuses/jiulonghu/library-seats.md'},
 '07-学习教务.md': {'八、文化素质教育学分（文教讲座）':'references/common/lectures.md'},
}
selected={}
for filename,mapping in selection.items():
    for heading,section in new_sections(filename):
        if heading in mapping:selected.setdefault(mapping[heading],[]).append((filename,heading,section))
for rel,parts in selected.items():
    body='\n\n'.join(x[2] for x in parts)
    if rel.endswith('network.md'):
        body=body.replace('初始账号 = 一卡通号；密码 = 身份证后六位','账号按统一身份认证；密码使用本人已修改的有效密码，不要把初始密码当作长期规则')
        body=body.replace('相当于校园网全国覆盖','覆盖及使用资格须以开通页面为准')
        body='> 包内文字自述来自2026公众号说明，未获取原推文核验。5G免费资格、套餐与运营商范围仅供参考，不承诺可开通。\n\n'+body
    if rel.endswith('lectures.md'):
        body='> 适用：按该文化素质教育规则培养的本科生，不适用于研究生。2023推文规则尚未核实是否适用所有2026级专业。\n> 签到存在来源差异：旧推文写结束后打卡；2026四牌楼图03写开场前签到、结束后签退。按当场讲座通知执行，不能一律只签退。\n\n'+body
    if rel.endswith('library-services.md'):
        body='> 新包自述“2026修订”，但本次无法访问其规则正文，不能把版本自述当作核验。借阅额度、续借次数、委托期限使用前以[图书馆规则入口](https://lib.seu.edu.cn/)确认为准；服务范围不得扩展到未接入系统的校区或机构。\n\n'+body
    if rel.endswith('library-seats.md'):
        body='> 座位与电源分布来自2022攻略的二次摘编，并非2026逐座核验；开放时间统一见[时段页](../../common/library-hours.md)。\n\n'+body
        body=body.replace('8:00–23:00 全馆出勤最高','开放时间见时段页').replace('周一到周五 8:30–12:00 / 13:30–17:00','开放时间见现场公告')
    scope='南京校区相关服务；苏州、无锡需先确认当地系统接入范围'
    if 'lectures' in rel:scope='本科生，具体依培养方案和年级'
    if 'library-seats' in rel:scope='九龙湖李文正图书馆'
    title={'network':'校园网与远程访问','digital-app':'数智东南应用','lectures':'本科文化素质教育讲座','library-services':'借阅与跨校区委托','library-seats':'李文正图书馆座位与电源参考'}[Path(rel).stem]
    body=re.sub(r'\[([^\]]+)\]\(\./[^)]+\.md\)',r'\1（从主题索引查阅）',body)
    page(rel,title,body,scope,'；'.join(x[0]+' / '+x[1] for x in parts),'仅核对包内摘编，原始推文/详细规则未全部获取')

destination_by_file={
 '00':'references/common/safety.md','01':'references/common/school-and-calendar.md','02':'references/common/onboarding-undergrad.md',
 '03':'references/campuses/sipailou/dorm-life.md','04':'references/campuses/sipailou/canteens.md','05':'references/campuses/sipailou/metro-bus-bike.md',
 '06':'references/campuses/sipailou/delivery-and-takeout.md','07':'references/common/academics.md','08':'references/campuses/sipailou/library-and-classrooms.md',
 '09':'references/common/library-hours.md','10':'references/official/index.md','11':'references/common/campus-card.md','12':'references/campuses/sipailou/sports-and-safety.md',
 '13':'references/common/insurance.md','14':'references/common/safety.md','15':'references/campuses/sipailou/around-food-and-commerce.md','16':'references/campuses/sipailou/tour.md',
 '17':'references/campuses/jiangbei/_index.md','99':'references/sources.md'}
for p in sorted(NEW.glob('*.md')):
    for heading,section in new_sections(p.name):
        dest=selection.get(p.name,{}).get(heading)
        if dest:action='retain-section';reason='按需摘编，保留适用范围及未核验声明'
        elif p.name=='README.md' or any(x in heading for x in ['回到主目录','相关链接','速查速答']):
            dest='references/index.md';action='deduplicate-navigation';reason='改成无事实副本的主题导航'
        else:
            dest=destination_by_file.get(p.name[:2],'references/index.md');action='curate-or-replace'
            reason='由目标专题筛选重写；新版图片/官方核验覆盖的采用核验口径，原文仍保留输入目录；未纳入内容可在外部原文审计逐节追溯'
        log(str(p.relative_to(ROOT))+'#'+heading,dest,action,reason)

# Link every factual page from a campus or shared index, then offer topic-oriented navigation.
for campus,name in NAMES.items():
    rel='references/campuses/'+campus+'/_index.md'
    lines=[]
    for p in sorted((OUT/Path(rel).parent).glob('*.md')):
        if p.name=='_index.md':continue
        title=p.read_text().splitlines()[0].lstrip('# ')
        lines.append('- ['+title+']('+p.name+')')
    page(rel,name+'校区资料','\n'.join(lines)+'\n\n共享事项：[校园卡](../../common/campus-card.md) · [医保适用范围](../../common/insurance.md) · [研究生迎新](../../common/onboarding-graduate.md) · [部门办事](../../official/index.md)',name,VERSIONS[campus],'按主题内来源分别判断；未注明本次核验的仍为历史资料')
official_index='# 建筑、部门与办事目录\n\n原结构化条目的独立文本版本。原库核验日期是历史记录，不代表本次全部复核；涉及现行时间、电话和窗口时遵循条目内专项说明。\n'
for kind,label in [('place','建筑与地点'),('department','部门'),('service','办事服务')]:
    official_index+='\n## '+label+'\n\n'+'\n'.join('- '+link('references/official/index.md',rel,title) for rel,title,k in official if k==kind)+'\n'
put('references/official/index.md',official_index)

index='''# 按事情查资料

先按问题选主题，再根据用户校区打开对应专页。只有校区、楼栋或身份会改变答案时才追问。以下目录只保存链接，不保存事实答案。

| 想解决的事 | 从这里读 |
|---|---|
| 新生报到、档案、材料 | [本科迎新](common/onboarding-undergrad.md)、[研究生迎新](common/onboarding-graduate.md) |
| 校历、学校概况、书院 | [学校与年度校历](common/school-and-calendar.md) |
| 选课、成绩、奖助、转专业 | [本科教务](common/academics.md)、[文教讲座](common/lectures.md) |
| 补卡、充值、挂失 | [校园卡](common/campus-card.md)；江北消费另读[江北食堂](campuses/jiangbei/canteens-and-payment.md) |
| 校园网、VPN、数智东南 | [校园网](common/network.md)、[数智东南](common/digital-app.md) |
| 图书馆时间、借还、预约 | [开放时间](common/library-hours.md)、[借还](common/library-services.md)，地点设施从校区入口读 |
| 宿舍、洗澡、洗衣、维修 | 对应校区入口中的住宿主题；[报修](common/repair.md) |
| 食堂、快递、外卖 | 对应校区入口中的餐饮、收寄主题；[供餐差异](common/dining-status.md) |
| 地铁、跨校区、校车 | 对应校区交通页；[接驳车说明](common/shuttle-status.md) |
| 医院、医保、紧急求助 | [安全求助](common/safety.md)、[医保](common/insurance.md)，医院地点从校区入口读 |
| 教学楼、自习、设施、运动 | 对应校区入口；[建筑及服务目录](official/index.md) |
| 办事、盖章、部门电话 | [部门及办事目录](official/index.md)；[四牌楼窗口核验](campuses/sipailou/administrative-services.md) |
| 带家长逛校园 | [四牌楼漫游](campuses/sipailou/tour.md) |
| 周边生活、购物 | 对应校区的周边主题 |

## 六校区入口

'''+ '\n'.join('- ['+name+'](campuses/'+campus+'/_index.md) — '+VERSIONS[campus] for campus,name in NAMES.items())+'''

兰台是九龙湖相关住宿区域，不作为第七个校区；入学身份与培养地点不能只按学院名称猜测。

## 使用边界

- 本包是不同来源、不同日期的资料整合；1.2.0 是 Skill 版本，不是全部事实的年份。
- 来源与冲突见[来源说明](sources.md)、[待核验事项](conflicts.md)。
- 排版方式见[回答卡片](../OUTPUT-CARDS.md)。
'''
put('references/index.md',index)

# Audit covers every source section, including excluded text, outside the distributable Skill.
(WORK/'source-decisions.json').write_text(json.dumps(changes,ensure_ascii=False,indent=2))
report='# 来源与更新对照表\n\n整理日期：'+DATE+'。原输入保持不变。细粒度源段落及其SHA-256见工作记录。\n\n| 来源条目 | 处理 | 发布包目标 | 原因 |\n|---|---|---|---|\n'
for x in changes:report+='| '+x['source'].replace('|','／')+' | '+x['action']+' | '+x['destination']+' | '+x['reason']+' |\n'
(BASE/'来源与更新对照表.md').write_text(report)
audit=[]
for p in sorted(NEW.glob('*.md')):
    for h,s in new_sections(p.name):audit.append({'source':p.name,'heading':h,'sha256':sha(s.encode()),'text':s})
(WORK/'original-new-sections.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2))
print('Built',len(list(OUT.rglob('*.md'))),'Markdown files;',len(changes),'source decisions')
