import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {moroccoThemes} from '../lib/morocco-themes';
import {lessonPhoto,sceneKind} from '../lib/lesson-visuals';
import LessonVisual from '../components/LessonVisual';
import {defaultSetup} from '../lib/lesson';

test('all 120 ready lesson stages render a real photo and animation or illustrated procedure',()=>{
 for(const {lesson} of moroccoThemes){
  const photo=lessonPhoto(lesson.setup);assert.ok(photo.generated);assert.ok(existsSync(`public${photo.src}`));
  for(const stage of lesson.stages){
   const html=renderToStaticMarkup(createElement(LessonVisual,{stage,setup:lesson.setup,activityId:'',setVisual:()=>{}}));
   assert.ok(html.includes(photo.src));assert.ok(html.includes('activity-motion-screen')||html.includes('stage-storyboard')||html.includes('task-demonstration'));
   assert.ok(!html.includes('lesson-picture-empty'));
  }
 }
});
test('teaching survey chart appears only for its supplied fictional data',()=>{
 const survey=moroccoThemes[18].lesson;
 assert.equal(sceneKind(survey.stages[3],survey.setup),'chart');
 assert.notEqual(sceneKind(survey.stages[3],{...defaultSetup,sample:'An unrelated survey with different figures.'}),'chart');
 assert.equal(new Set(moroccoThemes.map(t=>t.image)).size,5);
 for(const t of moroccoThemes)assert.ok(t.lesson.title.startsWith(t.unitTitle));
});
