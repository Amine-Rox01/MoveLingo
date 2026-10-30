import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {PrintLesson} from '../components/LessonView';
import {showcaseLessons} from '../lib/showcase';
test('student handouts keep private role cards but exclude teacher keys and listening scripts',()=>{
 const lesson=showcaseLessons[1].lesson;
 const html=renderToStaticMarkup(createElement(PrintLesson,{lesson,mode:'handout'}));
 assert.ok(html.includes('Private coach card A'));assert.ok(html.includes('Performer card B'));assert.ok(!html.includes('Observer card and answer key'));assert.ok(!html.includes('Teacher-read script'));assert.ok(!html.includes('Model question and answer'));
 const teacher=renderToStaticMarkup(createElement(PrintLesson,{lesson,mode:'lesson'}));assert.ok(teacher.includes('Observer card and answer key'));assert.ok(teacher.includes('Teacher-read script'));
});
